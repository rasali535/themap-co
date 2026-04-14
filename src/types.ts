export type AgentRole = 'Owner' | 'CEO' | 'Developer' | 'Designer' | 'Researcher' | 'QA' | 'Manager' | 'CFO' | 'HR';
export type AgentStatus = 'Idle' | 'Working' | 'Training' | 'Dismissed';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  skillLevel: number; // 1-10
  costPerHour: number;
  tasksCompleted: number;
  contractForTaskId?: string;
}

export type TaskStatus = 'Pending' | 'In Planning' | 'Awaiting CEO Approval' | 'Awaiting CFO Approval' | 'In Progress' | 'Needs Review' | 'Completed' | 'Failed' | 'Blocked';

export interface Task {
  id: string;
  title: string;
  description: string;
  complexity: number; // 1-10
  status: TaskStatus;
  assignedTo: string | null; // Agent ID
  progress: number; // 0-100
  createdAt: number; // timestamp
  startedAt?: number;
  completedAt?: number;
  requiredRole: AgentRole;
  output?: string;
  outputUrl?: string;
  outputFormat?: string;
  plan?: string;
  reviewRecommendation?: string;
  reviewStatus?: 'Pending' | 'Accepted' | 'Declined';
}

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface Alert {
  id: string;
  message: string;
  type: AlertType;
  timestamp: number;
}

export interface Budget {
  total: number;
  spent: number;
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  senderId: string;
  senderName: string;
  senderRole: AgentRole | 'System';
  content: string;
  type?: 'Chat' | 'Meeting';
}

export interface SimulationState {
  agents: Agent[];
  tasks: Task[];
  alerts: Alert[];
  chatHistory: ChatMessage[];
  budget: Budget;
  time: number; // Simulation time in hours
  isRunning: boolean;
  isThinking?: boolean;
  streamingMessage?: ChatMessage;
  performanceHistory: { time: number; completionRate: number; activeTasks: number }[];
}

