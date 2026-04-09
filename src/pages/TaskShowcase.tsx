import React from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Eye, CheckCircle2, ClipboardList, MessageSquare } from 'lucide-react';

export const TaskShowcase: React.FC = () => {
  const { state } = useSimulationContext();
  
  const completedTasks = state.tasks.filter(t => t.status === 'Completed' || t.output);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 pb-20"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <Eye className="w-6 h-6 text-regal-red" />
          Task Showcase
        </h2>
        <p className="text-sm text-zinc-500 mt-1">Review all executed tasks and their final deliverables.</p>
      </div>

      {completedTasks.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-zinc-200">
          <div className="bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-zinc-900 font-bold">No tasks completed yet</h3>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">
            Tasks will appear here once they pass the full planning and execution cycle.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {completedTasks.map((task) => {
            const agent = state.agents.find(a => a.id === task.assignedTo);
            return (
              <motion.div key={task.id} layout>
                <Card className="overflow-hidden border-zinc-200 hover:shadow-lg transition-shadow bg-white">
                  <CardHeader className="bg-zinc-900/5 border-b border-zinc-100 flex flex-row items-center justify-between p-6">
                    <div>
                      <CardTitle className="text-zinc-900">{task.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Implemented by:</span>
                        <span className="text-xs font-semibold text-regal-red">{agent?.name} ({agent?.role})</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-zinc-100 text-zinc-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-200">
                        Saved to Disk
                      </div>
                      <div className="px-3 py-1 bg-regal-green/10 text-regal-green rounded-full text-[10px] font-bold uppercase tracking-widest border border-regal-green/20">
                        Executed
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <ClipboardList className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Aproved Workflow Plan</span>
                        </div>
                        <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 text-sm text-zinc-600 leading-relaxed shadow-inner">
                          {task.plan}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Final Task Deliverable</span>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-zinc-200 text-sm text-zinc-900 font-medium leading-relaxed shadow-sm min-h-[120px]">
                          {task.output}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
