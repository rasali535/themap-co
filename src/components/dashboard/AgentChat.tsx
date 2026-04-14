import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '../ui/Button';

export const AgentChat: React.FC<{ 
  messages: ChatMessage[], 
  onSendMessage: (msg: string) => void,
  isThinking?: boolean
}> = ({ messages, onSendMessage, isThinking }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

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
                  <div className="bg-zinc-100 text-zinc-500 text-[10px] px-3 py-1 rounded-full my-4 font-bold uppercase tracking-widest border border-zinc-200">
                    {msg.content}
                  </div>
                ) : (
                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 mb-1 px-1 ${isUser ? 'flex-row-reverse text-right' : ''}`}>
                      <span className="font-bold text-[11px] text-zinc-500 uppercase tracking-wider">{msg.senderName}</span>
                      <span className="text-[9px] font-mono text-zinc-400">Step {msg.timestamp}</span>
                    </div>
                      <div className={`max-w-[90%] ${
                        msg.type === 'Meeting' ? 'border-2 border-regal-gold/20' : ''
                      } ${
                        isUser ? 'chat-bubble-user' : 
                        isCEO ? 'chat-bubble-ceo' : 
                        msg.senderRole === 'CFO' ? 'chat-bubble-cfo' : 'chat-bubble-agent'
                      }`}>
                        <p className="text-sm leading-relaxed">
                          {msg.type === 'Meeting' && (
                            <span className="text-[9px] font-bold text-regal-gold block mb-1 uppercase tracking-tighter italic">Strategic Alignment</span>
                          )}
                          {(msg.content || '').split(/(@\w+(?: \(\w+\))?)/g).map((part, i) => 
                          part.startsWith('@') ? (
                            <span key={i} className={`font-bold ${isUser ? 'text-white underline underline-offset-2' : 'text-regal-red'}`}>{part}</span>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {isThinking && (
            <div className="flex flex-col items-start animate-pulse">
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="font-bold text-[11px] text-zinc-400 uppercase tracking-wider">System</span>
              </div>
              <div className="chat-bubble-agent bg-zinc-100 border-zinc-200">
                <div className="flex gap-1 py-1">
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          {messages.length === 0 && !isThinking && (
            <div className="text-sm text-zinc-500 text-center py-8 font-medium">No messages yet.</div>
          )}
        </div>
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
          <form onSubmit={handleSend} className="flex gap-2 mb-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Give Ivy a directive..."
              className="flex-1 rounded-2xl border border-zinc-200 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-regal-red/20 focus:border-regal-red bg-white shadow-sm transition-all"
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim()} className="rounded-2xl shrink-0 bg-regal-red hover:bg-red-700 shadow-md">
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center">
            Ivy will wait for full info before delegating with <code>[DELEGATE: Role, Title, Description]</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
