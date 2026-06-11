import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-4xl font-bold text-blue-400">themap-co</h1>
        <p className="text-gray-400 mt-2">Band-Powered Geospatial Intelligence Dashboard</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400 border-b border-gray-700 pb-2">Active Workflows</h2>
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded shadow">
              <h3 className="font-bold text-lg">Task: Validate road infrastructure (Gaborone CBD)</h3>
              <div className="mt-2 text-sm">
                <span className="inline-block bg-blue-500 text-xs px-2 py-1 rounded mr-2">OrchestratorAgent</span>
                <span className="text-gray-300">Awaiting QA Validation from ValidationAgent...</span>
              </div>
            </div>
            {/* Additional mock workflow items could go here */}
          </div>
        </section>

        <aside className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400 border-b border-gray-700 pb-2">System Health</h2>
          <ul className="space-y-3">
            <li className="flex justify-between items-center bg-gray-700 p-2 rounded">
              <span>Risk Agent Confidence</span>
              <span className="font-mono text-green-400">98%</span>
            </li>
            <li className="flex justify-between items-center bg-gray-700 p-2 rounded">
              <span>Audit Trail Integrity</span>
              <span className="font-mono text-green-400">Verified</span>
            </li>
            <li className="flex justify-between items-center bg-gray-700 p-2 rounded">
              <span>Band Event Bus</span>
              <span className="font-mono text-green-400">Connected</span>
            </li>
          </ul>
        </aside>

        <section className="col-span-1 md:col-span-3 bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400 border-b border-gray-700 pb-2">Live Band Events</h2>
          <div className="bg-black text-green-500 font-mono p-4 rounded overflow-y-auto h-64 border border-gray-600 shadow-inner">
            <p>[PlannerAgent] TASK_CREATED - task-id-1234</p>
            <p>[OrchestratorAgent] TASK_ASSIGNED -> GeoIntelligenceAgent</p>
            <p>[GeoIntelligenceAgent] TASK_STARTED</p>
            <p>[GeoIntelligenceAgent] GEO_FEATURE_EXTRACTED - found 12 features</p>
            <p className="animate-pulse text-yellow-500">[ValidationAgent] Validating features...</p>
          </div>
        </section>
      </main>
    </div>
  );
}
