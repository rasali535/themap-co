import React, { useState } from 'react';
import { Task, Agent } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { ListTodo, Clock, AlertCircle, FileText } from 'lucide-react';

export const TaskList: React.FC<{ 
  tasks: Task[], 
  agents: Agent[],
  onAccept?: (id: string) => void,
  onDecline?: (id: string) => void
}> = ({ tasks, agents, onAccept, onDecline }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'review'>('active');
  
  const activeTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Needs Review').sort((a, b) => b.createdAt - a.createdAt);
  const reviewTasks = tasks.filter(t => t.status === 'Needs Review').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const completedTasks = tasks.filter(t => t.status === 'Completed').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const reviewCount = reviewTasks.length;

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
            Workflow ({activeTasks.length})
          </button>
          <button 
            onClick={() => setActiveTab('review')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'review' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          >
            Needs Review ({reviewCount})
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4 space-y-3">
          {activeTab === 'active' && (
            <>
              {activeTasks.length === 0 && <div className="text-sm text-zinc-500 text-center py-8 font-medium">No tasks currently in the workflow.</div>}
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

                    {(task.status === 'Awaiting CEO Approval' || task.status === 'Awaiting CFO Approval' || task.status === 'In Planning') && (
                      <div className="text-xs text-zinc-500 font-medium mt-1 flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] animate-pulse">Board Meeting</Badge>
                        Currently in {task.status}...
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
              {reviewCount === 0 && <div className="text-sm text-zinc-500 text-center py-8 font-medium">No tasks awaiting review.</div>}
              {reviewTasks.map(task => {
                return (
                  <div key={task.id} className="p-4 border border-zinc-200/60 rounded-xl bg-white shadow-sm flex flex-col gap-3 hover:border-zinc-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm text-zinc-900">{task.title}</div>
                        <div className="text-xs text-zinc-500 mt-1.5 flex items-center gap-2 font-medium">
                          <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0">{task.requiredRole}</Badge>
                          <span>Deliverable Ready</span>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">
                        Needs Approval
                      </Badge>
                    </div>
                    
                    <div className="mt-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <FileText className="w-3 h-3" />
                        CEO RECOMMENDATION
                      </div>
                      <p className="text-xs italic text-zinc-600 mb-4 px-2 border-l-2 border-zinc-200">
                        "{task.reviewRecommendation || 'The CEO suggests accepting this deliverable.'}"
                      </p>

                      <div className="flex items-center gap-2 mt-4">
                        <button 
                          onClick={() => onAccept?.(task.id)}
                          className="flex-1 bg-zinc-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                          Accept Deliverable
                        </button>
                        <button 
                          onClick={() => onDecline?.(task.id)}
                          className="flex-1 border border-zinc-200 text-zinc-600 text-xs font-bold py-2 rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                          Request Revision
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {completedTasks.length > 0 && (
                <div className="mt-8 pt-4 border-t border-zinc-100">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 mb-3">Recently Completed</h4>
                  <div className="space-y-2">
                    {completedTasks.map(task => (
                      <div key={task.id} className="p-3 border border-zinc-100 rounded-lg bg-zinc-50/50 flex justify-between items-center opacity-70">
                         <div className="text-xs font-medium text-zinc-700">{task.title}</div>
                         <Badge variant="secondary" className="text-[9px] h-5">Archived</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
