import React from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { Card, CardContent } from '../ui/Card';
import { motion } from 'framer-motion';
import { Clock, UserCheck, ShieldCheck, DollarSign, PlayCircle } from 'lucide-react';

export const ProjectPipeline: React.FC = () => {
  const { state } = useSimulationContext();
  
  const pipelineTasks = state.tasks.filter(t => 
    ['In Planning', 'Awaiting CEO Approval', 'Awaiting CFO Approval', 'In Progress'].includes(t.status)
  );

  if (pipelineTasks.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Planning': return <UserCheck className="w-4 h-4 text-regal-red" />;
      case 'Awaiting CEO Approval': return <ShieldCheck className="w-4 h-4 text-regal-gold" />;
      case 'Awaiting CFO Approval': return <DollarSign className="w-4 h-4 text-regal-green" />;
      case 'In Progress': return <PlayCircle className="w-4 h-4 text-zinc-900 animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Planning': return 'bg-red-50 text-regal-red border-red-100';
      case 'Awaiting CEO Approval': return 'bg-amber-50 text-regal-gold border-amber-100';
      case 'Awaiting CFO Approval': return 'bg-emerald-50 text-regal-green border-emerald-100';
      case 'In Progress': return 'bg-zinc-900 text-white border-zinc-900';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-100';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-5 h-5 text-zinc-600" />
        <h3 className="text-lg font-bold text-zinc-900">Project Pipeline</h3>
      </div>
      
      <div className="space-y-3">
        {pipelineTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            layout
          >
            <Card className="bg-white border border-zinc-200 overflow-hidden">
               <div className="h-1 w-full bg-zinc-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress || 25}%` }}
                    className={`h-full ${
                        task.status === 'In Progress' ? 'bg-amber-500' : 
                        task.status.includes('Approval') ? 'bg-indigo-500' : 'bg-blue-500'
                    }`}
                  />
               </div>
               <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${getStatusColor(task.status)} border flex shrink-0`}>
                      {getStatusIcon(task.status)}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{task.title}</h4>
                      <p className="text-xs text-zinc-500 font-medium">Assigned to: {state.agents.find(a => a.id === task.assignedTo)?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(task.status)} border`}>
                    {task.status}
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
