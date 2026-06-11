'use client';
import React, { useEffect, useState } from 'react';

type Artifact = {
  type: 'json' | 'map' | 'code' | 'empty';
  title: string;
  content: string;
};

type FlowEvent = {
  id: number;
  agent: string;
  action: string;
  detail: string;
  status: 'thinking' | 'complete' | 'error';
  artifact?: Artifact;
};

const AGENT_COLORS: Record<string, string> = {
  Planner: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Orchestrator: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  GeoIntelligence: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Validation: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Risk: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  Developer: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  QaTest: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  Reporting: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  Operations: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
  AuditCompliance: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
};

const CODE_PATCH = `
// metadata-parser.js
export function parseTopology(metadata) {
+  if (!metadata || !metadata.crs) {
+    throw new Error("Missing CRS mapping");
+  }
   return alignVectors(metadata);
}
`;

const JSON_EXTRACT = `
{
  "taskId": "task-gaborone-cbd",
  "vectors": 42,
  "crs": "EPSG:4326",
  "confidence": 0.98,
  "bounds": {
    "north": -24.653,
    "south": -24.661,
    "east": 25.918,
    "west": 25.905
  }
}
`;

const mockFlowData: Omit<FlowEvent, 'id'>[] = [
  { agent: "Planner", action: "TASK_CREATED", detail: "Update Gaborone CBD Roads", status: "complete" },
  { agent: "AuditCompliance", action: "AUDIT_LOGGED", detail: "Task instantiation recorded", status: "complete" },
  { agent: "Orchestrator", action: "TASK_ASSIGNED", detail: "Routed to @GeoIntelligenceAgent", status: "complete" },
  { agent: "GeoIntelligence", action: "DELIBERATING", detail: "Analyzing satellite imagery & extracting road vectors...", status: "thinking", artifact: { type: 'map', title: 'Satellite Processing', content: 'scanning' } },
  { agent: "GeoIntelligence", action: "GEO_FEATURE_EXTRACTED", detail: "42 road vectors found", status: "complete", artifact: { type: 'map', title: 'Extracted Topology', content: 'extracted' } },
  { agent: "Validation", action: "DELIBERATING", detail: "Cross-referencing topology with baseline...", status: "thinking" },
  { agent: "Validation", action: "QA_RESULT", detail: "Failed: Missing critical metadata tags", status: "error", artifact: { type: 'json', title: 'Validation Error', content: '{ "error": "Missing CRS Mapping", "code": 501 }' } },
  { agent: "Orchestrator", action: "WORKFLOW_ESCALATED", detail: "Re-routing task to @DeveloperAgent", status: "error" },
  { agent: "Developer", action: "DELIBERATING", detail: "Debugging metadata parsing logic...", status: "thinking" },
  { agent: "Developer", action: "SYSTEM_NOTIFICATION", detail: "Patch deployed: metadata-parser.js", status: "complete", artifact: { type: 'code', title: 'metadata-parser.js (diff)', content: CODE_PATCH } },
  { agent: "GeoIntelligence", action: "DELIBERATING", detail: "Re-extracting with patched parser...", status: "thinking" },
  { agent: "GeoIntelligence", action: "GEO_FEATURE_EXTRACTED", detail: "42 vectors (metadata fully attached)", status: "complete", artifact: { type: 'map', title: 'Validated Vectors', content: 'validated' } },
  { agent: "Validation", action: "DELIBERATING", detail: "Re-running topology validation...", status: "thinking" },
  { agent: "Validation", action: "QA_RESULT", detail: "Passed: 100% compliance", status: "complete" },
  { agent: "Risk", action: "DELIBERATING", detail: "Reasoning over geospatial impact using Featherless AI...", status: "thinking", artifact: { type: 'json', title: 'Risk Agent Reasoning', content: '{\n  "chain_of_thought": "Checking vector proximity to sensitive infrastructure...",\n  "flags": []\n}'} },
  { agent: "Risk", action: "RISK_ASSESSMENT", detail: "Confidence 0.98. Safe for production.", status: "complete", artifact: { type: 'json', title: 'Risk Final Output', content: JSON_EXTRACT } },
  { agent: "Orchestrator", action: "APPROVAL_GRANTED", detail: "Map Update Approved", status: "complete" },
  { agent: "Orchestrator", action: "MAP_UPDATE", detail: "PUBLISHED to Production", status: "complete", artifact: { type: 'map', title: 'Production Tile Update', content: 'production' } },
  { agent: "QaTest", action: "SYSTEM_NOTIFICATION", detail: "Regression checks passed", status: "complete" },
  { agent: "Reporting", action: "REPORT_GENERATED", detail: "Gaborone CBD mapping workflow finalized.", status: "complete", artifact: { type: 'json', title: 'Audit Manifest', content: '{ "status": "published", "hash": "8f3a1...9b2" }' } },
];

export default function Home() {
  const [events, setEvents] = useState<FlowEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact>({ type: 'empty', title: 'Waiting for Agent Artifacts...', content: '' });

  useEffect(() => {
    if (currentIndex < mockFlowData.length) {
      const currentItem = mockFlowData[currentIndex];
      
      const delay = currentItem.status === 'thinking' ? 4000 : 2500;

      const timer = setTimeout(() => {
        if (currentItem.artifact) {
          setCurrentArtifact(currentItem.artifact);
        }

        setEvents(prev => {
          const newEvents = [...prev];
          if (
            newEvents.length > 0 && 
            newEvents[newEvents.length - 1].status === 'thinking' && 
            newEvents[newEvents.length - 1].agent === currentItem.agent
          ) {
            newEvents.pop();
          }
          return [...newEvents, { ...currentItem, id: currentIndex }];
        });
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const activeEvent = events[events.length - 1];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">themap-co</h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Band Agentic Mesh Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
          </span>
          <span className="text-sm font-semibold text-emerald-300 tracking-wide">Band Connected</span>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Roster & State */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Currently Active</h2>
            {activeEvent ? (
              <div className="flex flex-col items-center text-center mt-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold border-2 mb-4 relative ${AGENT_COLORS[activeEvent.agent]} shadow-2xl transition-all`}>
                  {activeEvent.status === 'thinking' && <div className="absolute -inset-2 border-2 border-current rounded-3xl animate-ping opacity-20"></div>}
                  {activeEvent.agent.substring(0, 2)}
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">{activeEvent.agent}</h3>
                <p className={`mt-2 text-xs font-medium px-3 py-1 rounded-full ${
                  activeEvent.status === 'thinking' ? 'text-blue-300 bg-blue-900/40 animate-pulse' :
                  activeEvent.status === 'error' ? 'text-red-300 bg-red-900/40' :
                  'text-emerald-300 bg-emerald-900/40'
                }`}>
                  {activeEvent.status === 'thinking' ? 'Deliberating...' : activeEvent.action}
                </p>
              </div>
            ) : (
              <div className="text-slate-500 text-sm text-center py-8">Awaiting Workflow...</div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex-1">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Agent Mesh Roster</h2>
            <ul className="space-y-2">
              {Object.keys(AGENT_COLORS).map(agent => {
                const isActive = activeEvent?.agent === agent;
                return (
                  <li key={agent} className={`flex items-center justify-between p-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/10 scale-105 shadow-md' : 'hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${AGENT_COLORS[agent]}`}>
                        {agent.substring(0, 1)}
                      </div>
                      <span className={`text-xs ${isActive ? 'text-white font-bold' : 'text-slate-300 font-medium'}`}>{agent}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Middle Column: Live Feed */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative flex flex-col h-[750px]">
          <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            Live Collaboration Feed
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {events.map((ev, idx) => (
              <div key={ev.id} className="flex gap-3 items-start animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${AGENT_COLORS[ev.agent]} shadow-lg mt-1`}>
                  {ev.agent.substring(0, 1)}
                </div>
                <div className={`flex-1 p-3 rounded-xl border backdrop-blur-md ${
                  ev.status === 'error' ? 'bg-red-950/30 border-red-500/30' :
                  ev.status === 'thinking' ? 'bg-blue-950/30 border-blue-500/30' :
                  'bg-white/5 border-white/10'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-sm">{ev.agent}</span>
                    {ev.status === 'thinking' && <span className="text-blue-400 text-[10px] font-bold uppercase animate-pulse">Deliberating...</span>}
                    {ev.status === 'error' && <span className="text-red-400 text-[10px] font-bold uppercase">Alert</span>}
                  </div>
                  <div className="text-slate-300 text-xs">
                    <span className="font-mono bg-white/10 px-1 py-0.5 rounded mr-2">{ev.action}</span>
                    <span className={ev.status === 'thinking' ? 'text-slate-400 italic' : 'text-white'}>{ev.detail}</span>
                  </div>
                </div>
              </div>
            ))}
            {activeEvent?.status === 'thinking' && (
              <div className="flex gap-1 ml-12 mt-2 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Artifacts */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col h-[750px] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
              Output Artifact Viewer
            </h2>
          </div>
          <div className="flex-1 flex flex-col relative p-4">
            <h3 className="text-white text-sm font-bold mb-3 tracking-wide">{currentArtifact.title}</h3>
            
            <div className={`flex-1 rounded-xl border border-white/10 overflow-hidden flex flex-col p-4 shadow-inner relative ${
              currentArtifact.type === 'map' ? 'bg-slate-900' : 
              currentArtifact.type === 'code' ? 'bg-[#1e1e1e]' : 
              currentArtifact.type === 'empty' ? 'bg-transparent border-dashed items-center justify-center' :
              'bg-slate-950'
            }`}>
              
              {currentArtifact.type === 'empty' && (
                <span className="text-slate-500 text-sm font-medium">Waiting for agents...</span>
              )}

              {currentArtifact.type === 'map' && (
                <div className="w-full h-full relative">
                  {/* Grid Background */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  
                  {/* Scanning Animation for "processing" maps */}
                  {currentArtifact.content === 'scanning' && (
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10 pointer-events-none">
                      <div className="w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-bounce opacity-70"></div>
                    </div>
                  )}

                  {/* Nodes and Paths (SVG) */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M20,80 L40,40 L70,50 L90,20" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" className={currentArtifact.content === 'scanning' ? 'animate-pulse' : ''} />
                    {(currentArtifact.content === 'extracted' || currentArtifact.content === 'validated' || currentArtifact.content === 'production') && (
                      <path d="M10,90 L30,60 L60,70 L85,30" fill="none" stroke={currentArtifact.content === 'production' ? '#3b82f6' : '#10b981'} strokeWidth="1.5" />
                    )}
                    
                    <circle cx="30" cy="60" r="2" fill="#10b981" className="animate-pulse" />
                    <circle cx="30" cy="60" r="1.5" fill="#fff" />
                    
                    <circle cx="60" cy="70" r="2" fill="#10b981" />
                    <circle cx="60" cy="70" r="1.5" fill="#fff" />
                    
                    <circle cx="85" cy="30" r="2" fill="#ef4444" className="animate-bounce" />
                    <circle cx="85" cy="30" r="1" fill="#fff" />
                  </svg>

                  {/* HUD Elements */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm p-2 rounded text-[9px] text-emerald-400 font-mono border border-emerald-500/20">
                    <div>LAT: -24.653</div>
                    <div>LNG: 25.918</div>
                    <div className="mt-1 font-bold text-blue-400">STATUS: {currentArtifact.content.toUpperCase()}</div>
                  </div>
                </div>
              )}

              {(currentArtifact.type === 'json' || currentArtifact.type === 'code') && (
                <div className="w-full h-full overflow-hidden relative group">
                  <pre className="w-full h-full overflow-auto text-xs text-green-400 font-mono text-left leading-relaxed pb-4 scrollbar-thin scrollbar-thumb-white/10">
                    <code>{currentArtifact.content}</code>
                  </pre>
                  {/* Fade out bottom to look sleek */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                </div>
              )}

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
