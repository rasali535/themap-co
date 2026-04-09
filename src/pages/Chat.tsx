import React from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { AgentChat } from '../components/dashboard/AgentChat';
import { motion } from 'framer-motion';

export const Chat: React.FC = () => {
  const { state, sendMessage } = useSimulationContext();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Team Communications</h2>
        <p className="text-sm text-zinc-500 mt-1">Interact with your CEO and monitor team chatter.</p>
      </div>

      <div className="flex-1 min-h-0">
        <AgentChat 
          messages={state.streamingMessage ? [...state.chatHistory, state.streamingMessage] : state.chatHistory} 
          onSendMessage={sendMessage}
          isThinking={state.isThinking} 
        />
      </div>
    </motion.div>
  );
};
