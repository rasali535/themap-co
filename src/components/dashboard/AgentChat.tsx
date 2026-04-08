import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '../ui/Button';

export const AgentChat: React.FC<{ messages: ChatMessage[], onSendMessage: (msg: string) => void }> = ({ messages, onSendMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-zinc-100">
        <CardTitle className="flex items-center gap-2 text-zinc-900">
          <MessageSquare className="w-5 h-5 text-zinc-500" />
          Team Communications
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg) => {
            const isSystem = msg.senderRole === 'System';
            const isCEO = msg.senderRole === 'CEO';
            const isUser = msg.senderRole === 'Owner' || msg.senderRole === 'Manager';
            
            return (
              <div key={msg.id} className={`flex flex-col ${isSystem ? 'items-center' : isUser ? 'items-end' : 'items-start'}`}>
                {isSystem ? (
                  <div className="bg-zinc-100 text-zinc-500 text-xs px-3 py-1 rounded-full my-2 font-medium">
                    {msg.content}
                  </div>
                ) : (
                  <div className={`max-w-[85%] ${isCEO ? 'bg-blue-50 border-blue-100/50' : isUser ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 border-zinc-100'} border rounded-2xl p-3.5 shadow-sm`}>
                    <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'justify-end' : ''}`}>
                      <span className={`font-semibold text-sm ${isUser ? 'text-zinc-100' : 'text-zinc-900'}`}>{msg.senderName}</span>
                      <span className={`text-[10px] font-mono ${isUser ? 'text-zinc-400' : 'text-zinc-500'}`}>T+{msg.timestamp}h</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${isUser ? 'text-zinc-100' : 'text-zinc-700'}`}>
                      {/* Highlight mentions */}
                      {msg.content.split(/(@\w+(?: \(\w+\))?)/g).map((part, i) => 
                        part.startsWith('@') ? (
                          <span key={i} className={`font-medium px-1.5 py-0.5 rounded-md ${isUser ? 'text-blue-300 bg-blue-900/50' : 'text-blue-700 bg-blue-100/80'}`}>{part}</span>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="text-sm text-zinc-500 text-center py-8 font-medium">No messages yet.</div>
          )}
        </div>
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message the team..."
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white shadow-sm transition-all"
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim()} className="rounded-xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
