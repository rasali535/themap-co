'use client';
import React, { useEffect, useState } from 'react';

export default function Home() {
  const [events, setEvents] = useState<string[]>([
    "System Booting...",
    "[BandRoom] Connecting to themap-co-core..."
  ]);

  useEffect(() => {
    // Simulated live Band Room Event Stream for UI purposes
    const mockFlow = [
      "[PlannerAgent] TASK_CREATED: Update Gaborone CBD Roads",
      "[AuditComplianceAgent] AUDIT_LOGGED: TASK_CREATED",
      "[OrchestratorAgent] TASK_ASSIGNED -> GeoIntelligenceAgent",
      "[OperationsAgent] Monitoring Task Health...",
      "[GeoIntelligenceAgent] GEO_FEATURE_EXTRACTED: 42 road vectors found",
      "[ValidationAgent] QA_RESULT: Failed (Missing metadata)",
      "[OrchestratorAgent] WORKFLOW_ESCALATED: Re-routing task",
      "[DeveloperAgent] SYSTEM_NOTIFICATION: Suggested data-parser fix",
      "[GeoIntelligenceAgent] GEO_FEATURE_EXTRACTED: 42 vectors (metadata attached)",
      "[ValidationAgent] QA_RESULT: Passed",
      "[RiskAgent] RISK_ASSESSMENT: Confidence 0.98",
      "[OrchestratorAgent] APPROVAL_GRANTED",
      "[OrchestratorAgent] MAP_UPDATE: PUBLISHED",
      "[QaTestAgent] SYSTEM_NOTIFICATION: Regression checks passed",
      "[ReportingAgent] REPORT_GENERATED: Workflow Complete",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < mockFlow.length) {
        setEvents(prev => [...prev, mockFlow[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-blue-400">themap-co</h1>
          <p className="text-gray-400 mt-2">Band-Powered 10-Agent Geospatial Intelligence Platform</p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm font-semibold border border-green-700">Band Connected</span>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400 border-b border-gray-700 pb-2">Central Orchestrator State</h2>
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded shadow border-l-4 border-blue-500">
              <h3 className="font-bold text-lg">Task: Update Gaborone CBD Roads</h3>
              <div className="mt-2 text-sm flex gap-2">
                <span className="inline-block bg-blue-600 text-xs px-2 py-1 rounded">Orchestrator Controlled</span>
                <span className="inline-block bg-purple-600 text-xs px-2 py-1 rounded">Risk Gated</span>
                <span className="text-gray-300 animate-pulse">Processing Event Stream...</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400 border-b border-gray-700 pb-2">Agent Roster</h2>
          <ul className="space-y-2 text-sm overflow-y-auto max-h-48 pr-2">
            {['Planner', 'Orchestrator', 'GeoIntelligence', 'Validation', 'Risk', 'Operations', 'AuditCompliance', 'Reporting', 'Developer', 'QaTest'].map(agent => (
              <li key={agent} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                <span>{agent}Agent</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="col-span-1 md:col-span-3 bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400 border-b border-gray-700 pb-2">Live Band Room Stream (themap-co-core)</h2>
          <div className="bg-black text-green-500 font-mono text-sm p-4 rounded overflow-y-auto h-72 border border-gray-600 shadow-inner flex flex-col-reverse">
            {events.slice().reverse().map((ev, idx) => (
              <p key={idx} className="mb-1 border-b border-gray-800 pb-1">{ev}</p>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
