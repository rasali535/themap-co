import React from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { AgentChat } from '../components/dashboard/AgentChat';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export const Boardroom: React.FC = () => {
  const { state } = useSimulationContext();

  const meetingMessages = state.chatHistory.filter(msg => msg.type === 'Meeting');
  const allMeetingMessages = state.streamingMessage?.type === 'Meeting' 
    ? [...meetingMessages, state.streamingMessage] 
    : meetingMessages;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-regal-gold" />
            Executive Boardroom
          </h2>
          <p className="text-sm text-zinc-500 mt-1">High-speed strategic planning and rapid task execution hub.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AgentChat 
          messages={allMeetingMessages} 
          isThinking={state.isThinking}
          onSendMessage={() => {}} 
        />
      </div>
    </motion.div>
  );
};
