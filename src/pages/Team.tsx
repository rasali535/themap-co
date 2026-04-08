import React from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { AgentList } from '../components/dashboard/AgentList';
import { motion } from 'framer-motion';

export const Team: React.FC = () => {
  const { state } = useSimulationContext();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Team Roster</h2>
        <p className="text-sm text-zinc-500 mt-1">Manage your agents, view their stats, and monitor their status.</p>
      </div>

      <div className="flex-1 min-h-0">
        <AgentList agents={state.agents} />
      </div>
    </motion.div>
  );
};
