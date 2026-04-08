import React from 'react';
import { Agent } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Users, Briefcase, Activity } from 'lucide-react';

export const AgentList: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-zinc-100">
        <CardTitle className="flex items-center gap-2 text-zinc-900">
          <Users className="w-5 h-5 text-zinc-500" />
          Agent Roster
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4 space-y-3">
          {agents.map(agent => {
            const isDismissed = agent.status === 'Dismissed';
            return (
              <div key={agent.id} className={`flex items-center justify-between p-3 border border-zinc-200/60 rounded-xl bg-white hover:border-zinc-300 transition-colors shadow-sm ${isDismissed ? 'opacity-50 grayscale' : ''}`}>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-2 text-zinc-900">
                    {agent.name}
                    {agent.role === 'CEO' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">CEO</Badge>}
                    {agent.contractForTaskId && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-700 bg-blue-50">Contractor</Badge>}
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-3 mt-1.5 font-medium">
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-zinc-400"/> Lvl {agent.skillLevel}</span>
                    <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-zinc-400"/> {agent.tasksCompleted} tasks</span>
                  </div>
                </div>
                <Badge variant={
                  agent.status === 'Working' ? 'default' : 
                  agent.status === 'Idle' ? 'secondary' : 
                  isDismissed ? 'destructive' : 'outline'
                }>
                  {agent.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
