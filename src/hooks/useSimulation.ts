import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, Task, Alert, Budget, SimulationState, AgentRole, TaskStatus, ChatMessage } from '../types';

const INITIAL_BUDGET = 50000;
const TICK_RATE_MS = 1000; // 1 second real time = 1 hour simulation time

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

  const sendMessage = useCallback((content: string) => {
    setState(prev => {
      const newMsg: ChatMessage = {
        id: generateId(),
        timestamp: prev.time,
        senderId: 'user',
        senderName: 'You (Owner)',
        senderRole: 'Owner',
        content
      };
      
      const ceoReply: ChatMessage = {
        id: generateId(),
        timestamp: prev.time,
        senderId: prev.agents.find(a => a.role === 'CEO')?.id || 'ceo',
        senderName: prev.agents.find(a => a.role === 'CEO')?.name || 'CEO',
        senderRole: 'CEO',
        content: `Acknowledged, Boss. I'll take that into consideration.`
      };

      let extraTasks: Task[] = [];
      let extraAgents: Agent[] = [];
      
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('hire')) {
         let roleToHire: AgentRole | null = null;
         if (lowerContent.includes('developer')) roleToHire = 'Developer';
         else if (lowerContent.includes('designer')) roleToHire = 'Designer';
         else if (lowerContent.includes('qa')) roleToHire = 'QA';
         else if (lowerContent.includes('researcher')) roleToHire = 'Researcher';
         
         if (roleToHire) {
             const newAgent = createAgent(roleToHire, 5);
             extraAgents.push(newAgent);
             ceoReply.content = `Right away, Boss. I've hired a new ${roleToHire} (${newAgent.name}).`;
         } else {
             ceoReply.content = `I can hire someone, Boss. Which role do you need? (Developer, Designer, QA, Researcher)`;
         }
      } else if (lowerContent.includes('task') || lowerContent.includes('do') || lowerContent.includes('build') || lowerContent.includes('create')) {
         ceoReply.content = `Understood, Boss. I've added a new task to the backlog.`;
         extraTasks.push(createTask(prev.time));
      } else {
         ceoReply.content = `Yes, Boss. I'm keeping the team on track.`;
      }

      return {
        ...prev,
        agents: [...prev.agents, ...extraAgents],
        tasks: [...prev.tasks, ...extraTasks],
        chatHistory: [...prev.chatHistory, newMsg, ceoReply]
      };
    });
  }, []);

  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState(prevState => {
        // Deep clone arrays to avoid React strict mode mutation issues
        const agents = prevState.agents.map(a => ({ ...a }));
        const tasks = prevState.tasks.map(t => ({ ...t }));
        const performanceHistory = [...prevState.performanceHistory];
        
        let { budget, time, chatHistory } = prevState;
        const newTime = time + 1;
        let newSpent = budget.spent;
        const newAlerts: Alert[] = [];
        const newChats: ChatMessage[] = [];

        const addAlertLocal = (message: string, type: Alert['type']) => {
          newAlerts.push({ id: generateId(), message, type, timestamp: newTime });
        };

        const addChatLocal = (sender: Pick<Agent, 'id' | 'name' | 'role'> | { id: string, name: string, role: 'System' }, content: string) => {
          newChats.push({
            id: generateId(),
            timestamp: newTime,
            senderId: sender.id,
            senderName: sender.name,
            senderRole: sender.role,
            content
          });
        };

        // 1. Pay agents
        agents.forEach(agent => {
          if (agent.status !== 'Dismissed') {
            newSpent += agent.costPerHour;
          }
        });

        const cfo = agents.find(a => a.role === 'CFO');
        const hr = agents.find(a => a.role === 'HR');

        if (newSpent > budget.total * 0.9 && budget.spent <= budget.total * 0.9) {
          addAlertLocal('Budget is running low! (90% spent)', 'warning');
          if (cfo) {
            addChatLocal(cfo, '@channel Warning: We are running out of budget! Wrap up tasks quickly.');
          } else {
            const ceo = agents.find(a => a.role === 'CEO');
            if (ceo) addChatLocal(ceo, '@channel Warning: We are running out of budget! Wrap up tasks quickly.');
          }
        }
        if (newSpent >= budget.total) {
          addAlertLocal('Budget depleted! Simulation paused.', 'error');
          addChatLocal({ id: 'system', name: 'System', role: 'System' }, 'Budget depleted. Operations suspended.');
          return { ...prevState, isRunning: false, budget: { ...budget, spent: newSpent }, alerts: [...newAlerts, ...prevState.alerts].slice(0, 50), chatHistory: [...prevState.chatHistory, ...newChats] };
        }

        // 2. CEO Logic (Delegate & Hire)
        const ceo = agents.find(a => a.role === 'CEO');
        if (ceo) {
          const pendingTasks = tasks.filter(t => t.status === 'Pending');
          
          pendingTasks.forEach(task => {
            // Find available agent
            const availableAgent = agents.find(a => a.role === task.requiredRole && a.status === 'Idle');
            if (availableAgent) {
              // Assign task
              task.assignedTo = availableAgent.id;
              task.status = 'In Progress';
              task.startedAt = newTime;
              availableAgent.status = 'Working';
              addAlertLocal(`CEO assigned "${task.title}" to ${availableAgent.name}`, 'info');
              addChatLocal(ceo, `@${availableAgent.name}, please handle "${task.title}".`);
              addChatLocal(availableAgent, `On it! Starting "${task.title}" now.`);
            } else {
              // No agent available. Should we hire?
              // Check if we already have a contractor hired for this task
              const isContractorHired = agents.some(a => a.contractForTaskId === task.id);
              
              if (!isContractorHired && newTime - task.createdAt > 3) {
                if (hr && cfo) {
                  // CEO requests HR to hire a contractor
                  addChatLocal(ceo, `@${hr.name}, we need a temporary ${task.requiredRole} for "${task.title}".`);
                  
                  // HR asks CFO for budget
                  const estimatedCost = (task.complexity * 10 + 20) * 10; // rough estimate
                  addChatLocal(hr, `@${cfo.name}, requesting budget for a temporary ${task.requiredRole}. Estimated cost: $${estimatedCost}.`);
                  
                  // CFO approves or rejects
                  if (budget.total - newSpent > estimatedCost + 1000) {
                    addChatLocal(cfo, `Budget approved for temporary ${task.requiredRole}.`);
                    
                    // HR hires
                    const newAgent = createAgent(task.requiredRole, task.complexity, task.id);
                    agents.push(newAgent);
                    addAlertLocal(`HR hired contractor ${newAgent.name} for "${task.title}".`, 'success');
                    addChatLocal(hr, `I've hired ${newAgent.name} on a temporary contract for this specific task to save funds.`);
                    addChatLocal(newAgent, `Hi team! I'm ready to work on "${task.title}".`);
                    
                    // Assign immediately
                    task.assignedTo = newAgent.id;
                    task.status = 'In Progress';
                    task.startedAt = newTime;
                    newAgent.status = 'Working';
                    addChatLocal(ceo, `@${newAgent.name}, jump right in.`);
                  } else {
                    if (newTime % 10 === 0) {
                      addChatLocal(cfo, `Budget rejected. We cannot afford a temporary ${task.requiredRole} right now.`);
                      addAlertLocal(`Task "${task.title}" is blocked due to lack of funds.`, 'warning');
                    }
                  }
                } else {
                  // Fallback if HR/CFO are missing
                  if ((budget.total - newSpent) > 5000) {
                    const roleCount = agents.filter(a => a.role === task.requiredRole && a.status !== 'Dismissed').length;
                    if (roleCount < 3) {
                      const newAgent = createAgent(task.requiredRole, Math.min(10, task.complexity + 1));
                      agents.push(newAgent);
                      addAlertLocal(`CEO hired new ${task.requiredRole}: ${newAgent.name} to handle complex/backlogged tasks.`, 'success');
                      addChatLocal(ceo, `We have too many pending ${task.requiredRole} tasks. I've hired ${newAgent.name} to help out.`);
                      addChatLocal(newAgent, `Hi team! I'm ${newAgent.name}, the new ${newAgent.role}. Ready to work!`);
                      
                      // Assign immediately
                      task.assignedTo = newAgent.id;
                      task.status = 'In Progress';
                      task.startedAt = newTime;
                      newAgent.status = 'Working';
                      addChatLocal(ceo, `@${newAgent.name}, jump right in and take "${task.title}".`);
                    } else {
                      if (newTime % 10 === 0) {
                         addAlertLocal(`Task "${task.title}" is blocked. Need more ${task.requiredRole}s but team is full.`, 'warning');
                         addChatLocal(ceo, `We're blocked on "${task.title}". We need more ${task.requiredRole}s but our team size is capped.`);
                      }
                    }
                  }
                }
              }
            }
          });

          // Check for failing/stuck tasks to reallocate
          tasks.filter(t => t.status === 'In Progress').forEach(task => {
            const assignedAgent = agents.find(a => a.id === task.assignedTo);
            if (assignedAgent && task.complexity > assignedAgent.skillLevel + 2) {
               // Task is too hard
               if (Math.random() < 0.1) { // 10% chance per tick to realize it's too hard
                  addAlertLocal(`CEO noticed "${task.title}" is too complex for ${assignedAgent.name}. Reallocating...`, 'warning');
                  addChatLocal(ceo, `@${assignedAgent.name}, I see you're stuck on "${task.title}". I'll reassign it to someone else.`);
                  task.status = 'Pending';
                  task.assignedTo = null;
                  assignedAgent.status = 'Idle';
               }
            }
          });
        }

        // 3. Process Tasks
        tasks.forEach(task => {
          if (task.status === 'In Progress' && task.assignedTo) {
            const agent = agents.find(a => a.id === task.assignedTo);
            if (agent) {
              // Calculate progress based on skill vs complexity
              const skillDiff = agent.skillLevel - task.complexity;
              // Base progress is 10% per tick. Modified by skill difference.
              let progressRate = 10 + (skillDiff * 2); 
              
              // Ensure minimum progress if assigned, but very slow if under-skilled
              progressRate = Math.max(2, progressRate);

              // Random chance of failure if severely under-skilled
              if (skillDiff < -3 && Math.random() < 0.05) {
                task.status = 'Failed';
                agent.status = 'Idle';
                addAlertLocal(`Task "${task.title}" failed by ${agent.name} (Too complex).`, 'error');
                addChatLocal(agent, `I'm really struggling with "${task.title}". It's too complex for me right now. I failed to complete it.`);
              } else {
                task.progress += progressRate;
                if (task.progress >= 100) {
                  task.progress = 100;
                  task.status = 'Completed';
                  task.completedAt = newTime;
                  task.output = `[Deliverable: ${task.title}]\n\nCompleted by: ${agent.name} (${agent.role})\nQuality Score: ${Math.floor(Math.random() * 10) + 90}/100\n\nSummary: The task was executed successfully according to the specified parameters. All tests passed and the final assets have been packaged for client review.`;
                  agent.status = 'Idle';
                  agent.tasksCompleted += 1;
                  addAlertLocal(`${agent.name} completed "${task.title}".`, 'success');
                  addChatLocal(agent, `Just finished "${task.title}"!`);
                  if (ceo) {
                    addChatLocal(ceo, `Boss, @${agent.name} just finished "${task.title}". The deliverable is ready for your review.`);
                  }
                  
                  // Dismiss contractor if applicable
                  if (agent.contractForTaskId === task.id) {
                    agent.status = 'Dismissed';
                    addAlertLocal(`Contractor ${agent.name} was dismissed after completing their task.`, 'info');
                    if (hr) {
                      addChatLocal(hr, `@${agent.name}, thanks for your work. Your contract is now complete and you are dismissed.`);
                    }
                  }
                }
              }
            }
          }
        });

        // 4. Generate new tasks randomly
        if (Math.random() < 0.15 && tasks.length < 50) { // 15% chance per tick
          const newTask = createTask(newTime);
          tasks.push(newTask);
          if (Math.random() < 0.3 && ceo) {
            addChatLocal(ceo, `A new task just came in: "${newTask.title}". I'll assign it shortly.`);
          }
        }

        // 5. Update Performance History
        if (newTime % 5 === 0) {
          const completed = tasks.filter(t => t.status === 'Completed').length;
          const total = tasks.length;
          const completionRate = total > 0 ? (completed / total) * 100 : 0;
          const activeTasks = tasks.filter(t => t.status === 'In Progress').length;
          performanceHistory.push({ time: newTime, completionRate, activeTasks });
          if (performanceHistory.length > 20) performanceHistory.shift();
        }

        return {
          ...prevState,
          agents,
          tasks,
          budget: { ...budget, spent: newSpent },
          time: newTime,
          alerts: [...newAlerts, ...prevState.alerts].slice(0, 50),
          chatHistory: [...prevState.chatHistory, ...newChats],
          performanceHistory
        };
      });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [state.isRunning]);

  return {
    state,
    toggleSimulation,
    addAlert,
    sendMessage
  };
};
