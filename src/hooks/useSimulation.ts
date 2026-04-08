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

      // 2. State Machine Logic
      tasks.forEach(task => {
        // --- Phase 1: Assignment ---
        if (task.status === 'Pending') {
          const availableAgent = agents.find(a => a.role === task.requiredRole && a.status === 'Idle');
          if (availableAgent) {
            task.assignedTo = availableAgent.id;
            task.status = 'In Planning';
            availableAgent.status = 'Working';
            addAlertLocal(`Meeting: Agents are convening to discuss "${task.title}".`, 'info');
          }
        }
      });

      return {
        ...prevState,
        agents,
        tasks,
        alerts: [...newAlerts, ...prevState.alerts].slice(0, 50),
        chatHistory: [...prevState.chatHistory, ...newChats],
        time: time + 1
      };
    });

    // 3. Async Logic for active tasks
    const currentTasks = stateRef.current.tasks;
    
    for (const task of currentTasks) {
      // --- Phase 2: Planning Meeting ---
      if (task.status === 'In Planning' && !task.plan) {
         const agent = stateRef.current.agents.find(a => a.id === task.assignedTo);
         const plan = await callLlama(`Discuss and map a way forward for the task: "${task.title}". Context: ${task.description}. What is the execution plan?`, `Agent ${agent?.name} is leading the meeting.`);
         
         setState(prev => ({
           ...prev,
           tasks: prev.tasks.map(t => t.id === task.id ? { ...t, plan, status: 'Awaiting CEO Approval' } : t),
           chatHistory: [...prev.chatHistory, {
             id: generateId(),
             timestamp: prev.time,
             senderId: agent?.id || 'system',
             senderName: agent?.name || 'Agent',
             senderRole: agent?.role || 'Developer',
             content: `Meeting concluded for "${task.title}". Plan: ${plan}`
           }]
         }));
         addAlert(`Planning: CEO approval required for the "${task.title}" roadmap.`, 'info');
      }

      // --- Phase 3: CEO Approval ---
      else if (task.status === 'Awaiting CEO Approval') {
        const ceo = stateRef.current.agents.find(a => a.role === 'CEO');
        const approvalComment = await callLlama(`Review this plan for "${task.title}": ${task.plan}. Approve it or suggest changes.`, "You are the CEO. Give a formal approval.");
        
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: 'Awaiting CFO Approval' } : t),
          chatHistory: [...prev.chatHistory, {
            id: generateId(),
            timestamp: prev.time,
            senderId: ceo?.id || 'ceo',
            senderName: ceo?.name || 'CEO',
            senderRole: 'CEO',
            content: `CEO Approval for "${task.title}": ${approvalComment}`
          }]
        }));
        addAlert(`Approval: CEO has approved the plan for "${task.title}". Moving to CFO review.`, 'success');
      }

      // --- Phase 4: CFO Approval ---
      else if (task.status === 'Awaiting CFO Approval') {
        const cfo = stateRef.current.agents.find(a => a.role === 'CFO');
        const budgetAvailable = stateRef.current.budget.total - stateRef.current.budget.spent > 1000;
        
        if (budgetAvailable) {
          setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: 'In Progress' } : t),
            chatHistory: [...prev.chatHistory, {
              id: generateId(),
              timestamp: prev.time,
              senderId: cfo?.id || 'cfo',
              senderName: cfo?.name || 'CFO',
              senderRole: 'CFO',
              content: `Budget check for "${task.title}" passed. Execution authorized.`
            }]
          }));
          addAlert(`Budget: CFO authorized funding for "${task.title}". Execution starting.`, 'success');
        } else {
          addAlert(`Budget: Insufficient funds for "${task.title}". Task blocked.`, 'error');
           setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: 'Blocked' } : t)
          }));
        }
      }

      // --- Phase 5: Execution (Qwen) ---
      else if (task.status === 'In Progress' && !task.output) {
        const agent = stateRef.current.agents.find(a => a.id === task.assignedTo);
        if (agent) {
          const result = await callQwen(`Execute the following task according to the plan: "${task.plan}". Final Deliverable for: "${task.title}"`, task.description);
          const recommendation = await callLlama(result, `Review this task output for "${task.title}" and provide a concise CEO recommendation (Accept/Improve/Reject). Keep it under 2 sentences.`);

          setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === task.id ? { 
              ...t, 
              status: 'Needs Review', 
              progress: 100, 
              output: result,
              reviewRecommendation: recommendation,
              reviewStatus: 'Pending',
              completedAt: prev.time 
            } : t),
            budget: { ...prev.budget, spent: prev.budget.spent + (agent.costPerHour * task.complexity) }
          }));
          
          addAlert(`Review Required: "${task.title}" has been submitted for final review.`, 'info');
        }
      }
    }
  }, [addAlert]);

  const acceptTask = useCallback((taskId: string) => {
     setState(prev => {
        const task = prev.tasks.find(t => t.id === taskId);
        if (!task) return prev;
        
        const agent = prev.agents.find(a => a.id === task.assignedTo);
        
        return {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'Completed', reviewStatus: 'Accepted' } : t),
          agents: prev.agents.map(a => a.id === task.assignedTo ? { ...a, status: 'Idle', tasksCompleted: a.tasksCompleted + 1 } : a),
          alerts: [{ id: generateId(), message: `Task "${task.title}" accepted!`, type: 'success', timestamp: prev.time }, ...prev.alerts]
        };
     });
  }, []);

  const declineTask = useCallback((taskId: string) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;

      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { 
          ...t, 
          status: 'In Planning', 
          reviewStatus: 'Declined', 
          output: undefined, 
          plan: undefined,
          progress: 0 
        } : t),
        agents: prev.agents.map(a => a.id === task.assignedTo ? { ...a, status: 'Working' } : a),
        alerts: [{ id: generateId(), message: `Task "${task.title}" declined. Agents are re-convening for a new plan.`, type: 'warning', timestamp: prev.time }, ...prev.alerts]
      };
    });
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
    sendMessage,
    acceptTask,
    declineTask
  };
};
