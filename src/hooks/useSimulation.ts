import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, Task, Alert, Budget, SimulationState, AgentRole, TaskStatus, ChatMessage } from '../types';
import { callLlama, callQwen } from '../lib/llm';

const INITIAL_BUDGET = 50000;
// No more TICK_RATE_MS as we are moving to 100% workflow

const generateId = () => Math.random().toString(36).substr(2, 9);

const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank', 'Ivy', 'Jack'];

const createAgent = (role: AgentRole, skillLevel: number, contractForTaskId?: string): Agent => ({
  id: generateId(),
  name: `${NAMES[Math.floor(Math.random() * NAMES.length)]} (${role})`,
  role,
  status: 'Idle',
  skillLevel,
  costPerHour: skillLevel * 10 + 20,
  tasksCompleted: 0,
  contractForTaskId,
});

const TASK_TEMPLATES = [
  { title: 'Design Landing Page', role: 'Designer' as AgentRole, complexity: 4 },
  { title: 'Implement Auth API', role: 'Developer' as AgentRole, complexity: 7 },
  { title: 'Write Unit Tests', role: 'QA' as AgentRole, complexity: 3 },
  { title: 'Market Research', role: 'Researcher' as AgentRole, complexity: 5 },
  { title: 'Optimize Database', role: 'Developer' as AgentRole, complexity: 8 },
  { title: 'Create Logo', role: 'Designer' as AgentRole, complexity: 6 },
  { title: 'E2E Testing', role: 'QA' as AgentRole, complexity: 6 },
  { title: 'Competitor Analysis', role: 'Researcher' as AgentRole, complexity: 4 },
  { title: 'Refactor Legacy Code', role: 'Developer' as AgentRole, complexity: 9 },
  { title: 'Design System Update', role: 'Designer' as AgentRole, complexity: 8 },
];

const createTask = (time: number): Task => {
  const template = TASK_TEMPLATES[Math.floor(Math.random() * TASK_TEMPLATES.length)];
  // Randomize complexity slightly
  const complexity = Math.max(1, Math.min(10, template.complexity + Math.floor(Math.random() * 3) - 1));
  return {
    id: generateId(),
    title: template.title,
    description: `Task requiring ${template.role} skills.`,
    complexity,
    status: 'Pending',
    assignedTo: null,
    progress: 0,
    createdAt: time,
    requiredRole: template.role,
  };
};

export const useSimulation = () => {
  const [state, setState] = useState<SimulationState>({
    agents: [
      createAgent('CEO', 10),
      createAgent('CFO', 9),
      createAgent('HR', 8),
      createAgent('Developer', 5),
      createAgent('Designer', 6),
    ],
    tasks: [createTask(0), createTask(0), createTask(0)],
    alerts: [{ id: generateId(), message: 'Simulation started.', type: 'info', timestamp: 0 }],
    chatHistory: [{ id: generateId(), timestamp: 0, senderId: 'system', senderName: 'System', senderRole: 'System', content: 'Simulation initialized. Agents are ready.' }],
    budget: { total: INITIAL_BUDGET, spent: 0 },
    time: 0,
    isRunning: false,
    performanceHistory: [],
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const addAlert = (message: string, type: Alert['type']) => {
    setState(prev => ({
      ...prev,
      alerts: [{ id: generateId(), message, type, timestamp: prev.time }, ...prev.alerts].slice(0, 50)
    }));
  };

  const toggleSimulation = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  // Main Workflow Processor
  const processWorkflow = useCallback(async () => {
    setState(prevState => {
      // 1. Initial State Sync/Check
      const agents = prevState.agents.map(a => ({ ...a }));
      const tasks = prevState.tasks.map(t => ({ ...t }));
      let { budget, time } = prevState;
      const newAlerts: Alert[] = [];
      const newChats: ChatMessage[] = [];

      const addAlertLocal = (message: string, type: Alert['type']) => {
        newAlerts.push({ id: generateId(), message, type, timestamp: time });
      };

      // 2. CEO Delegation Logic (Reactive)
      const ceo = agents.find(a => a.role === 'CEO');
      if (ceo) {
        const pendingTasks = tasks.filter(t => t.status === 'Pending');
        pendingTasks.forEach(task => {
          const availableAgent = agents.find(a => a.role === task.requiredRole && a.status === 'Idle');
          if (availableAgent) {
            task.assignedTo = availableAgent.id;
            task.status = 'In Progress';
            availableAgent.status = 'Working';
            addAlertLocal(`Workflow: Assigned "${task.title}" to ${availableAgent.name}`, 'info');
          }
        });
      }

      return {
        ...prevState,
        agents,
        tasks,
        alerts: [...newAlerts, ...prevState.alerts].slice(0, 50),
        chatHistory: [...prevState.chatHistory, ...newChats],
        time: time + 1 // Treat each workflow step as one 'hour' or unit of time
      };
    });

    // 3. Process 'In Progress' tasks with Qwen
    const tasksToProcess = stateRef.current.tasks.filter(t => t.status === 'In Progress' && !t.output);
    for (const task of tasksToProcess) {
      const agent = stateRef.current.agents.find(a => a.id === task.assignedTo);
      if (agent) {
        const result = await callQwen(`Execute the following task and provide a final deliverable report: "${task.title}".`, task.description);
        
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? { 
            ...t, 
            status: 'Completed', 
            progress: 100, 
            output: result, 
            completedAt: prev.time 
          } : t),
          agents: prev.agents.map(a => a.id === agent.id ? { ...a, status: 'Idle', tasksCompleted: a.tasksCompleted + 1 } : a),
          budget: { ...prev.budget, spent: prev.budget.spent + (agent.costPerHour * task.complexity) } // Cost based on work done
        }));
        
        const ceo = stateRef.current.agents.find(a => a.role === 'CEO');
        if (ceo) {
           setState(prev => ({
             ...prev,
             chatHistory: [...prev.chatHistory, {
               id: generateId(),
               timestamp: prev.time,
               senderId: agent.id,
               senderName: agent.name,
               senderRole: agent.role,
               content: `Task "${task.title}" is complete. Deliverable has been attached to the task record.`
             }]
           }));
        }
      }
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // 1. Add User message
    setState(prev => {
      const newMsg: ChatMessage = {
        id: generateId(),
        timestamp: prev.time,
        senderId: 'user',
        senderName: 'You (Owner)',
        senderRole: 'Owner',
        content
      };
      return { ...prev, chatHistory: [...prev.chatHistory, newMsg] };
    });

    // 2. Call Llama for Reasoning
    const ceo = stateRef.current.agents.find(a => a.role === 'CEO');
    const recentHistory = stateRef.current.chatHistory.slice(-5).map(m => `${m.senderName}: ${m.content}`).join('\n');
    
    const reasoning = await callLlama(content, `Workflow Context: We are moving to a direct execution model.\nHistory:\n${recentHistory}`);
    
    setState(prev => {
      const ceoReply: ChatMessage = {
        id: generateId(),
        timestamp: prev.time,
        senderId: ceo?.id || 'ceo',
        senderName: ceo?.name || 'CEO',
        senderRole: 'CEO',
        content: reasoning
      };

      let extraTasks: Task[] = [];
      let extraAgents: Agent[] = [];
      const lowerReasoning = reasoning.toLowerCase();

      // Predictive hiring/tasking based on reasoning
      if (lowerReasoning.includes('hire') || lowerReasoning.includes('recruiting')) {
         const roles: AgentRole[] = ['Developer', 'Designer', 'QA', 'Researcher'];
         const role = roles.find(r => lowerReasoning.includes(r.toLowerCase()));
         if (role) extraAgents.push(createAgent(role, 5));
      }
      
      if (lowerReasoning.includes('task') || lowerReasoning.includes('create') || lowerReasoning.includes('add')) {
          extraTasks.push(createTask(prev.time));
      }

      return {
        ...prev,
        agents: [...prev.agents, ...extraAgents],
        tasks: [...prev.tasks, ...extraTasks],
        chatHistory: [...prev.chatHistory, ceoReply]
      };
    });

    // 3. Automatically trigger workflow processing after reasoning
    await processWorkflow();
  }, [processWorkflow]);

  // No more interval-based simulation logic. 
  // Everything is driven by processWorkflow and sendMessage.

  return {
    state,
    toggleSimulation,
    addAlert,
    sendMessage
  };
};
