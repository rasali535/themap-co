import React, { useState } from 'react';
import { Task, Agent } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { ListTodo, Clock, AlertCircle, FileText } from 'lucide-react';

export const TaskList: React.FC<{ tasks: Task[], agents: Agent[] }> = ({ tasks, agents }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'review'>('active');
  
  const activeTasks = tasks.filter(t => t.status !== 'Completed').sort((a, b) => b.createdAt - a.createdAt);
  const completedTasks = tasks.filter(t => t.status === 'Completed').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col h-full">
      <CardHeader className="pb-0 border-b border-zinc-100">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="flex items-center gap-2 text-zinc-900">
            <ListTodo className="w-5 h-5 text-zinc-500" />
            Task Management
          </CardTitle>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          >
            Active Tasks ({activeTasks.length})
          </button>
          <button 
            onClick={() => setActiveTab('review')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'review' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          >
            Client Review ({completedTasks.length})
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4 space-y-3">
          {activeTab === 'active' && (
            <>
              {activeTasks.length === 0 && <div className="text-sm text-zinc-500 text-center py-8 font-medium">No active tasks.</div>}
              {activeTasks.map(task => {
                const assignedAgent = agents.find(a => a.id === task.assignedTo);
                return (
                  <div key={task.id} className="p-4 border border-zinc-200/60 rounded-xl bg-white shadow-sm flex flex-col gap-3 hover:border-zinc-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm text-zinc-900">{task.title}</div>
                        <div className="text-xs text-zinc-500 mt-1.5 flex items-center gap-2 font-medium">
                          <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0">{task.requiredRole}</Badge>
                          <span>Complexity: {task.complexity}/10</span>
                        </div>
                      </div>
                      <Badge variant={
                        task.status === 'In Progress' ? 'default' :
                        task.status === 'Failed' ? 'destructive' :
                        task.status === 'Pending' ? 'warning' : 'secondary'
                      }>
                        {task.status}
                      </Badge>
                    </div>
                    
                    {task.status === 'In Progress' && (
                      <div className="space-y-1.5 mt-1">
                        <div className="flex justify-between text-xs text-zinc-500 font-medium">
                          <span>Assigned to: <span className="text-zinc-700">{assignedAgent?.name}</span></span>
                          <span className="text-zinc-900">{Math.round(task.progress)}%</span>
                        </div>
                        <Progress value={task.progress} />
                      </div>
                    )}
                    
                    {task.status === 'Pending' && (
                      <div className="text-xs text-amber-600 flex items-center gap-1.5 font-medium mt-1">
                        <Clock className="w-3.5 h-3.5" /> Waiting for available {task.requiredRole}...
                      </div>
                    )}

                    {task.status === 'Failed' && (
                      <div className="text-xs text-red-600 flex items-center gap-1.5 font-medium mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Task failed. Awaiting reassignment.
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {activeTab === 'review' && (
            <>
              {completedTasks.length === 0 && <div className="text-sm text-zinc-500 text-center py-8 font-medium">No completed tasks for review yet.</div>}
              {completedTasks.map(task => {
                return (
                  <div key={task.id} className="p-4 border border-zinc-200/60 rounded-xl bg-white shadow-sm flex flex-col gap-3 hover:border-zinc-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm text-zinc-900">{task.title}</div>
                        <div className="text-xs text-zinc-500 mt-1.5 flex items-center gap-2 font-medium">
                          <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0">{task.requiredRole}</Badge>
                          <span>Completed at T+{task.completedAt}h</span>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
                        Ready for Review
                      </Badge>
                    </div>
                    
                    <div className="mt-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                        <FileText className="w-3.5 h-3.5" />
                        Deliverable Output
                      </div>
                      <p className="text-sm text-zinc-600 whitespace-pre-wrap font-mono text-xs">
                        {task.output || 'No output generated.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
