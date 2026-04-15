import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, Task, Alert, Budget, SimulationState, AgentRole, TaskStatus, ChatMessage } from '../types';
import { callLlama, callQwen, streamLlama, saveTaskOutput } from '../lib/llm';

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
      createAgent('Manager', 'Zara', 7),
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

  // Persistent call wrapper to handle low-memory environment stalls
  const callWithPersistence = async (
    fn: (p: string, c?: string) => Promise<string>, 
    prompt: string, 
    context: string = '', 
    maxRetries: number = 3
  ): Promise<string> => {
    let lastResult = '';
    for (let i = 0; i < maxRetries; i++) {
      lastResult = await fn(prompt, context);
      
      const isError = lastResult.startsWith('Error:') || 
                      lastResult.includes('timed out') || 
                      lastResult.includes('unavailable') ||
                      lastResult.includes('fetch failed');
                      
      if (!isError) return lastResult;
      
      console.warn(`Retry ${i + 1}/${maxRetries} for LLM call due to: ${lastResult}`);
      addAlert(`Connection stutter detected. Self-healing retry ${i + 1}/3 in progress...`, 'warning');
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s for RAM to clear
    }
    return lastResult;
  };

  // Automated Workflow Processor
  const processWorkflow = useCallback(async () => {
    const currentTasks = stateRef.current.tasks;
    
    for (const task of currentTasks) {
      // --- Phase 1: Assignment (Sync) ---
      if (task.status === 'Pending') {
        const availableAgent = stateRef.current.agents.find(a => 
          (a.role.toLowerCase() === task.requiredRole.toLowerCase() || a.name.toLowerCase().includes(task.requiredRole.toLowerCase())) && 
          a.status === 'Idle'
        );
        if (availableAgent) {
           setState(prev => ({
             ...prev,
             agents: prev.agents.map(a => a.id === availableAgent.id ? { ...a, status: 'Working' } : a),
             tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: 'In Planning', assignedTo: availableAgent.id } : t),
             alerts: [{ id: generateId(), message: `Task assigned to ${availableAgent.name}.`, type: 'info', timestamp: prev.time }, ...prev.alerts]
           }));
           return; 
        }
      }

      // --- Phase 2: Planning Meeting ---
      if (task.status === 'In Planning' && !task.plan) {
         const agent = stateRef.current.agents.find(a => a.id === task.assignedTo);
         const ceo = stateRef.current.agents.find(a => a.role === 'CEO');
         
         const proposedPlan = await callWithPersistence(callLlama, `You are a high-level strategist at Ras Ali Labs. Rapidly map a technically efficient, professional roadmap for: "${task.title}". Context: ${task.description}. Your plan must be actionable, detailed, and technically sound. DO NOT REFUSE THIS TASK. YOU MUST PROVIDE A PLAN.`, `Agent ${agent?.name} is pitching a high-speed execution plan.`);
         
         if (proposedPlan.startsWith('Error:') || proposedPlan.includes('I cannot assist')) return; // Stop this cycle

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

         const refinedPlan = await callWithPersistence(callLlama, `Technical proposal for "${task.title}": ${proposedPlan}. As CEO Ivy, synthesize this into a strategic mandate. Don't just repeat the plan—tell the team why this task is critical and exactly what victory looks like for Ras Ali Labs. YOUR RESPONSE IS MANDATORY.`, "You are CEO Ivy. Be decisive, strategic, and focused on high-level goals. YOU ARE THE LEADER.");

         if (refinedPlan.startsWith('Error:') || refinedPlan.includes('I cannot assist')) return;

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
        const approvalComment = await callWithPersistence(callLlama, `Review this technical roadmap for "${task.title}": ${task.plan}. As CEO, give your final assessment. Is it ambitious enough? Does it align with our mission? Issue the final order to proceed or demand better.`, "You are the CEO. Be authoritative and inspiring.");
        
        if (approvalComment.startsWith('Error:')) return;

        
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
          const result = await callWithPersistence(callQwen, `You are an expert ${agent.role} at Ras Ali Labs. EXECUTION IS MANDATORY. DO NOT REFUSE. Execute the following task according to the plan: "${task.plan}". Final Deliverable for: "${task.title}". If the task requires a document, webpage, or report, provide the FULL source (HTML/Markdown/Text). REMINDER: You must provide the actual code or content, not an apology.`, task.description);
          
          if (result.startsWith('Error:')) return;

          // Detect refusal
          const isRefusal = result.toLowerCase().includes("i'm sorry") || 
                            result.toLowerCase().includes("cannot assist") || 
                            result.toLowerCase().includes("ai language model") ||
                            result.length < 50;

          const reviewPrompt = isRefusal 
            ? `The agent failed to execute the task "${task.title}" and provided a refusal instead of output. As CEO Ivy, provide a scathing review and demand they redo it with actual content. DO NOT ACCEPT THIS.`
            : `Review this task output for "${task.title}" and provide a concise CEO recommendation (Accept/Improve/Reject). Output: ${result.substring(0, 1000)}. Keep it under 2 sentences.`;

          const recommendation = await callWithPersistence(callLlama, reviewPrompt, `You are CEO Ivy. You only accept high-quality technical work.`);

          if (isRefusal) {
            // Force a redo by setting back to planning or just leaving it for manual intervention
            // For now, we'll mark it as Needs Review so the user can see the failure, but set the recommendation to Reject
             addAlert(`Task "${task.title}" suspected of AI refusal. CEO has flagged for review.`, 'error');
          }

          
          // Detect and extract format
          let format = 'txt';
          let extractedResult = result;
          
          const htmlMatch = result.match(/```html\n?([\s\S]*?)```/i) || (result.trim().toLowerCase().startsWith('<!doctype html') || result.trim().toLowerCase().startsWith('<html') ? [null, result] : null);
          if (htmlMatch) {
            format = 'html';
            extractedResult = htmlMatch[1] || result;
          } else if (result.includes('```md') || result.includes('```markdown') || result.includes('# ') || result.includes('**')) {
            format = 'md';
            extractedResult = result.replace(/```(md|markdown)\n?([\s\S]*?)```/gi, '$2');
          }

          setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === task.id ? { 
              ...t, 
              status: 'Needs Review', 
              progress: 100, 
              output: extractedResult,
              outputFormat: format,
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
        // Schedule next run much faster for "quick time" execution
        timeoutId = setTimeout(runCycle, 1500);
      }
    };

    timeoutId = setTimeout(runCycle, 1500);
    return () => clearTimeout(timeoutId);
  }, [processWorkflow, state.isRunning]);

  const acceptTask = useCallback((taskId: string) => {
     setState(prev => {
        const task = prev.tasks.find(t => t.id === taskId);
        if (!task) return prev;
        
        // Auto-save output to local filesystem
        if (task.output) {
          saveTaskOutput(task.title, task.output, task.outputFormat || 'txt').then(result => {
            if (result) {
              setState(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === taskId ? { ...t, outputUrl: result.url } : t),
                alerts: [{ id: generateId(), message: `Product "${task.title}" saved to local drive. Click to view.`, type: 'success', timestamp: prev.time }, ...prev.alerts]
              }));
            }
          }).catch(err => console.error('Auto-save failed:', err));
        }

        return {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'Completed', reviewStatus: 'Accepted' } : t),
          agents: prev.agents.map(a => a.id === task.assignedTo ? { ...a, status: 'Idle', tasksCompleted: a.tasksCompleted + 1 } : a),
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
    }, `You are CEO Ivy at Ras Ali Labs. Your role is to understand the owner's request, gather ALL necessary details, and then DELEGATE tasks to the team.
    
    GUIDELINES:
    1. WAIT: Do not delegate until you have full information. Ask clarifying questions if needed.
    2. DELEGATE: When ready to assign a task, use the exactly format: [DELEGATE: ROLE, TITLE, DESCRIPTION]
    3. ROLE: You MUST use one of these roles: Developer, Designer, Researcher, Manager, or CFO.
    
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
      
      // Look for delegation format: [DELEGATE: ROLE, TITLE, DESCRIPTION]
      const delegateMatch = finalContent.match(/\[DELEGATE:\s*([^,]+),\s*([^,]+),\s*([^\]]+)\]/i);

      if (delegateMatch) {
          const [, role, title, description] = delegateMatch;
          const newTask: Task = {
            id: generateId(),
            title: title.trim(),
            description: description.trim(),
            complexity: 5,
            status: 'Pending',
            assignedTo: null,
            progress: 0,
            createdAt: prev.time,
            requiredRole: (role.trim() as AgentRole) || 'Developer'
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
