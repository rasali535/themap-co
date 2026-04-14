import React from 'react';
import { useSimulationContext } from '../../context/SimulationContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X, ClipboardList, MessageSquare, AlertCircle, ShieldCheck, Eye } from 'lucide-react';
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
                          <span className="bg-regal-red/10 text-regal-red text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-regal-red/20">
                            {agent?.role || 'Agent'} Submitted
                          </span>
                          <h4 className="text-lg font-bold text-zinc-900">{task.title}</h4>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-inner">
                          <div className="flex items-center gap-2 text-zinc-400 mb-3">
                            <ClipboardList className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Approved Roadmap</span>
                          </div>
                          <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
                            {task.plan}
                          </p>
                          
                          <div className="flex items-center justify-between gap-2 text-zinc-400 mb-3 pt-5 border-t border-zinc-100">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Final Deliverable</span>
                            </div>
                            {task.outputFormat === 'html' && task.outputUrl && (
                                <a 
                                  href={task.outputUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                  <Eye className="w-3 h-3" />
                                  View Live Product
                                </a>
                            )}
                          </div>
                          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 text-xs text-zinc-600 italic leading-relaxed max-h-32 overflow-y-auto">
                            {task.output}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-regal-gold/20 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="w-12 h-12 text-regal-gold" />
                          </div>
                          <div className="flex items-center gap-2 text-regal-gold mb-1.5 relative z-10">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">CEO Recommendation</span>
                          </div>
                          <p className="text-sm text-zinc-800 font-semibold relative z-10">
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
