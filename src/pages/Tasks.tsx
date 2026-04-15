import React from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { TaskList } from '../components/dashboard/TaskList';
import { motion } from 'framer-motion';

export const Tasks: React.FC = () => {
  const { state, acceptTask, declineTask } = useSimulationContext();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Task Management</h2>
        <p className="text-sm text-zinc-500 mt-1">Monitor active tasks and review completed deliverables.</p>
      </div>

      <div className="flex-1 min-h-0">
        <TaskList 
          tasks={state.tasks} 
          agents={state.agents} 
          onAccept={acceptTask}
          onDecline={declineTask}
        />
      </div>
    </motion.div>
  );
};
