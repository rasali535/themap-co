/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimulation } from './hooks/useSimulation';
import { AgentList } from './components/dashboard/AgentList';
import { TaskList } from './components/dashboard/TaskList';
import { BudgetOverview } from './components/dashboard/BudgetOverview';
import { PerformanceChart } from './components/dashboard/PerformanceChart';
import { AlertsFeed } from './components/dashboard/AlertsFeed';
import { AgentChat } from './components/dashboard/AgentChat';
import { Button } from './components/ui/Button';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

export default function App() {
  const { state, toggleSimulation, sendMessage } = useSimulation();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-4 md:p-8 selection:bg-zinc-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 text-white p-2 rounded-xl shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">AI Agent Workflow</h1>
              <p className="text-sm text-zinc-500 font-medium mt-0.5">Autonomous task delegation and resource management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono font-medium bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200 text-zinc-600 flex items-center gap-2 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${state.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
              T+{state.time}h
            </div>
            <Button onClick={toggleSimulation} variant={state.isRunning ? "destructive" : "default"} className="w-32 shadow-sm">
              {state.isRunning ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
            </Button>
            <Button variant="outline" size="icon" onClick={() => window.location.reload()} className="shadow-sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Top Row: Budget & Stats */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
             <BudgetOverview budget={state.budget} />
             <div className="col-span-1 md:col-span-2">
                <PerformanceChart data={state.performanceHistory} />
             </div>
          </div>

          {/* Middle Row: Agents & Tasks */}
          <AgentList agents={state.agents} />
          <TaskList tasks={state.tasks} agents={state.agents} />
          
          {/* Bottom Row: Alerts & Chat */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
             <AlertsFeed alerts={state.alerts} />
             <AgentChat messages={state.chatHistory} onSendMessage={sendMessage} />
          </div>

        </div>
      </div>
    </div>
  );
}



