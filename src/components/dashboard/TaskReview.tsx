import React from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X, ClipboardList, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TaskReview: React.FC = () => {
  const { state, acceptTask, declineTask } = useSimulationContext();
  
  const reviewTasks = state.tasks.filter(t => t.status === 'Needs Review');

  if (reviewTasks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-zinc-900">Tasks Pending Review</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {reviewTasks.map((task) => {
            const agent = state.agents.find(a => a.id === task.assignedTo);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className="bg-white border-2 border-indigo-100 shadow-md hover:border-indigo-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {agent?.role || 'Agent'} Submitted
                          </span>
                          <h4 className="text-lg font-bold text-zinc-900">{task.title}</h4>
                        </div>
                        
                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                          <div className="flex items-center gap-2 text-zinc-500 mb-2">
                            <ClipboardList className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tight">Approved Plan</span>
                          </div>
                          <p className="text-sm text-zinc-600 mb-4">
                            {task.plan}
                          </p>
                          
                          <div className="flex items-center gap-2 text-zinc-500 mb-2 pt-4 border-t border-zinc-200/60">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tight">Final Output</span>
                          </div>
                          <p className="text-sm text-zinc-600 italic line-clamp-3">
                            "{task.output}"
                          </p>
                        </div>

                        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50">
                          <div className="flex items-center gap-2 text-amber-600 mb-1">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tight text-amber-600">CEO Recommendation</span>
                          </div>
                          <p className="text-sm text-zinc-700 font-medium">
                            {task.reviewRecommendation || "Looking good, proceed with caution."}
                          </p>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2 justify-end min-w-[140px]">
                        <Button 
                          onClick={() => acceptTask(task.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" /> Accept
                        </Button>
                        <Button 
                          onClick={() => declineTask(task.id)}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                        >
                          <X className="w-4 h-4 mr-2" /> Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
