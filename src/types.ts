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

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'Blocked';

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
}

export interface SimulationState {
  agents: Agent[];
  tasks: Task[];
  alerts: Alert[];
  chatHistory: ChatMessage[];
  budget: Budget;
  time: number; // Simulation time in hours
  isRunning: boolean;
  performanceHistory: { time: number; completionRate: number; activeTasks: number }[];
}

