import React from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { BudgetOverview } from '../components/dashboard/BudgetOverview';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { AlertsFeed } from '../components/dashboard/AlertsFeed';
import { motion } from 'framer-motion';
import { Users, ListTodo, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export const Dashboard: React.FC = () => {
  const { state } = useSimulationContext();

  const activeAgentsCount = state.agents.filter(a => a.status === 'Working').length;
  const totalAgentsCount = state.agents.filter(a => a.status !== 'Dismissed').length;
  
  const activeTasksCount = state.tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending').length;
  const completedTasksCount = state.tasks.filter(t => t.status === 'Completed').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard Overview</h2>
        <p className="text-sm text-zinc-500 mt-1">High-level metrics and recent alerts.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-zinc-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">{activeAgentsCount} <span className="text-sm font-medium text-zinc-500">/ {totalAgentsCount}</span></div>
              <div className="text-xs font-medium text-zinc-500 mt-0.5">Active Agents</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-zinc-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">{activeTasksCount}</div>
              <div className="text-xs font-medium text-zinc-500 mt-0.5">Pending & Active Tasks</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-zinc-200/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-zinc-900">{completedTasksCount}</div>
              <div className="text-xs font-medium text-zinc-500 mt-0.5">Tasks Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BudgetOverview budget={state.budget} />
        <div className="col-span-1 md:col-span-2">
          <PerformanceChart data={state.performanceHistory} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 h-[400px]">
        <AlertsFeed alerts={state.alerts} />
      </div>
    </motion.div>
  );
};
