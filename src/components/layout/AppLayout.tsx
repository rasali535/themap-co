import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useSimulationContext } from '../../context/SimulationContext';
import { Button } from '../ui/Button';
import { Play, Pause, RotateCcw, Activity, LayoutDashboard, Users, ListTodo, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export const AppLayout: React.FC = () => {
  const { state, toggleSimulation, sendMessage } = useSimulationContext();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/team', icon: Users, label: 'Team Roster' },
    { to: '/tasks', icon: ListTodo, label: 'Tasks & Review' },
    { to: '/chat', icon: MessageSquare, label: 'Communications' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex selection:bg-zinc-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-zinc-100">
          <div className="bg-zinc-900 text-white p-2 rounded-xl shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">AI Workflow</h1>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5 uppercase tracking-wider">Workflow Engine</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="text-xs text-zinc-400 font-medium text-center">
            Owner: maplininc@gmail.com
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="md:hidden flex items-center gap-3">
            <div className="bg-zinc-900 text-white p-1.5 rounded-lg shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900">AI Workflow</h1>
          </div>
          
          <div className="hidden md:block">
            {/* Breadcrumbs or Page Title could go here */}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="text-xs font-mono font-medium bg-zinc-100 px-3 py-2 rounded-lg border border-zinc-200 text-zinc-600 flex items-center gap-2 shadow-sm">
              <div className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`} />
              Step {state.time}
            </div>
            <Button onClick={() => sendMessage("Proceed with the next steps of the project.")} variant="default" className="w-40 shadow-sm">
              <Play className="w-4 h-4 mr-2" /> Next Step
            </Button>
            <Button variant="outline" size="icon" onClick={() => window.location.reload()} className="shadow-sm">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Nav (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex justify-around p-2 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
