import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, Task, Alert, Budget, SimulationState, AgentRole, TaskStatus, ChatMessage } from '../types';
import { callLlama, callQwen, saveTaskOutput } from '../lib/llm';

const STORAGE_KEY = 'themap_workflow_state';
const INITIAL_BUDGET = 100000;

const generateId = () => Math.random().toString(36).substr(2, 9);

const createAgent = (role: AgentRole, name: string, skillLevel: number): Agent => ({
  id: generateId(),
  name: `${name} (${role})`,
  role,
  status: 'Idle',
  skillLevel,
  costPerHour: skillLevel * 15 + 25,
  tasksCompleted: 0,
});

const getInitialState = (): SimulationState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.agents) && Array.isArray(parsed.tasks)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved state:', e);
  }

  return {
    agents: [
      createAgent('CEO', 'Ivy', 10),
      createAgent('CFO', 'Silas', 9),
      createAgent('Developer', 'Marcus', 8),
      createAgent('Designer', 'Elena', 7),
      createAgent('Researcher', 'Soren', 6),
    ],
    tasks: [],
    alerts: [{ id: generateId(), message: 'System Initialized: Local Workstation Ready.', type: 'info', timestamp: 0 }],
    chatHistory: [{ id: generateId(), timestamp: 0, senderId: 'system', senderName: 'System', senderRole: 'System', content: 'Ras Ali Labs Engine is online. Waiting for directives.' }],
    budget: { total: INITIAL_BUDGET, spent: 0 },
    time: 0,
    isRunning: true,
    isThinking: false,
    performanceHistory: [],
  };
};

export const useSimulation = () => {
  const [state, setState] = useState<SimulationState>(getInitialState());

  // Persistence logic
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const stateRef = useRef(state);
  stateRef.current = state;

  const addAlert = useCallback((message: string, type: Alert['type']) => {
    setState(prev => ({
      ...prev,
      alerts: [{ id: generateId(), message, type, timestamp: prev.time }, ...prev.alerts].slice(0, 50)
    }));
  }, []);

  // Automated Workflow Processor
  const processWorkflow = useCallback(async () => {
    const currentTasks = stateRef.current.tasks;
    
    for (const task of currentTasks) {
      // --- Phase 1: Assignment (Sync) ---
      if (task.status === 'Pending') {
        const availableAgent = stateRef.current.agents.find(a => a.role === task.requiredRole && a.status === 'Idle');
        if (availableAgent) {
           setState(prev => ({
             ...prev,
             agents: prev.agents.map(a => a.id === availableAgent.id ? { ...a, status: 'Working' } : a),
             tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: 'In Planning', assignedTo: availableAgent.id } : t),
             alerts: [{ id: generateId(), message: `Task assigned to ${availableAgent.name}.`, type: 'info', timestamp: prev.time }, ...prev.alerts]
           }));
           return; // Exit to let the next cycle pick it up
        }
      }

      // --- Phase 2: Planning Meeting ---
      if (task.status === 'In Planning' && !task.plan) {
         const agent = stateRef.current.agents.find(a => a.id === task.assignedTo);
         const ceo = stateRef.current.agents.find(a => a.role === 'CEO');
         
         const proposedPlan = await callLlama(`Discuss and map a way forward for the task: "${task.title}". Context: ${task.description}. What is your technical execution plan?`, `Agent ${agent?.name} is leading the initial technical meeting.`);
         
         setState(prev => ({
           ...prev,
           chatHistory: [...prev.chatHistory, {
             id: generateId(),
             timestamp: prev.time,
             senderId: agent?.id || 'system',
             senderName: agent?.name || 'Agent',
             senderRole: agent?.role || 'Developer',
             content: `[PLANNING PROPOSAL] Roadmap for "${task.title}": ${proposedPlan}`,
             type: 'Meeting'
           }]
         }));

         const refinedPlan = await callLlama(`Technical proposal for "${task.title}": ${proposedPlan}. As CEO Ivy, refine this into a final directive for the team.`, "You are CEO Ivy. Provide a high-level strategic directive based on the tech plan.");

         setState(prev => ({
           ...prev,
           tasks: prev.tasks.map(t => t.id === task.id ? { ...t, plan: refinedPlan, status: 'Awaiting CEO Approval' } : t),
           chatHistory: [...prev.chatHistory, {
             id: generateId(),
             timestamp: prev.time,
             senderId: ceo?.id || 'ceo',
             senderName: ceo?.name || 'CEO Ivy',
             senderRole: 'CEO',
             content: `[CEO DIRECTIVE] Ivy's directive for "${task.title}": ${refinedPlan}`,
             type: 'Meeting'
           }]
         }));
         return;
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
             content: `[CEO APPROVAL] CEO Review for "${task.title}": ${approvalComment}`,
             type: 'Meeting'
           }]
        }));
        return;
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
               content: `[CFO APPROVAL] Budget check for "${task.title}" passed. Execution authorized.`,
               type: 'Meeting'
             }]
          }));
        } else {
           setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: 'Blocked' } : t)
          }));
        }
        return;
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
        }
        return;
      }
    }
  }, []);

  const isProcessing = useRef(false);

  // Automatic Workflow Trigger
  useEffect(() => {
    if (!state.isRunning) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const runCycle = async () => {
      if (isProcessing.current) return;
      
      try {
        isProcessing.current = true;
        setState(prev => ({ ...prev, isThinking: true }));
        await processWorkflow();
      } finally {
        isProcessing.current = false;
        setState(prev => ({ ...prev, isThinking: false }));
        // Schedule next run only after the current one completes
        timeoutId = setTimeout(runCycle, 4000);
      }
    };

    timeoutId = setTimeout(runCycle, 4000);
    return () => clearTimeout(timeoutId);
  }, [processWorkflow, state.isRunning]);

  const acceptTask = useCallback((taskId: string) => {
     setState(prev => {
        const task = prev.tasks.find(t => t.id === taskId);
        if (!task) return prev;
        
        // Auto-save output to local filesystem
        if (task.output) {
          saveTaskOutput(task.title, task.output).catch(err => console.error('Auto-save failed:', err));
        }

        return {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'Completed', reviewStatus: 'Accepted' } : t),
          agents: prev.agents.map(a => a.id === task.assignedTo ? { ...a, status: 'Idle', tasksCompleted: a.tasksCompleted + 1 } : a),
          alerts: [{ id: generateId(), message: `Task "${task.title}" finalized and saved to disk.`, type: 'success', timestamp: prev.time }, ...prev.alerts]
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
      };
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
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

    const ceo = stateRef.current.agents.find(a => a.role === 'CEO');
    const recentHistory = stateRef.current.chatHistory.slice(-5).map(m => `${m.senderName}: ${m.content}`).join('\n');
    
    setState(prev => ({ ...prev, isThinking: true }));

    const streamingId = generateId();
    let finalContent = '';

    const { streamLlama } = await import('../lib/llm');

    await streamLlama(content, (updatedContent) => {
      finalContent = updatedContent;
      setState(prev => ({
        ...prev,
        streamingMessage: {
          id: streamingId,
          timestamp: prev.time,
          senderId: ceo?.id || 'ceo',
          senderName: ceo?.name || 'CEO Ivy',
          senderRole: 'CEO',
          content: updatedContent,
          type: 'Meeting'
        }
      }));
    }, `You are CEO Ivy. Your role is to understand the owner's request and DELEGATE tasks to the team. 
    History:\n${recentHistory}`);
    
    setState(prev => {
      const ceoReply: ChatMessage = {
        id: streamingId,
        timestamp: prev.time,
        senderId: ceo?.id || 'ceo',
        senderName: ceo?.name || 'CEO Ivy',
        senderRole: 'CEO',
        content: finalContent,
        type: 'Meeting'
      };

      let extraTasks: Task[] = [];
      const lowerReasoning = finalContent.toLowerCase();

      if (lowerReasoning.includes('task') || lowerReasoning.includes('delegating') || lowerReasoning.includes('execute') || lowerReasoning.includes('build')) {
          const newTask: Task = {
            id: generateId(),
            title: content.length < 50 ? content : content.slice(0, 30) + "...",
            description: finalContent,
            complexity: 5,
            status: 'Pending',
            assignedTo: null,
            progress: 0,
            createdAt: prev.time,
            requiredRole: lowerReasoning.includes('designer') ? 'Designer' : 
                          lowerReasoning.includes('research') ? 'Researcher' : 'Developer'
          };
          extraTasks.push(newTask);
      }

      return {
        ...prev,
        isThinking: false,
        streamingMessage: undefined,
        tasks: [...prev.tasks, ...extraTasks],
        chatHistory: [...prev.chatHistory, ceoReply]
      };
    });
  }, []);

  return {
    state,
    toggleSimulation: () => {}, // No-op in production
    addAlert,
    sendMessage,
    acceptTask,
    declineTask
  };
};
