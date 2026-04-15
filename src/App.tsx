/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Team } from './pages/Team';
import { Tasks } from './pages/Tasks';
import { Chat } from './pages/Chat';
import { Boardroom } from './pages/Boardroom';
import { TaskShowcase } from './pages/TaskShowcase';
import { Landing } from './pages/Landing';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route index element={<Landing />} />
            <Route path="/" element={<AppLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="boardroom" element={<Boardroom />} />
              <Route path="team" element={<Team />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="showcase" element={<TaskShowcase />} />
              <Route path="chat" element={<Chat />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </SimulationProvider>
  );
}



