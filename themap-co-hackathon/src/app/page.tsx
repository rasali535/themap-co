'use client';
import React, { useEffect, useState, useRef } from 'react';

type Artifact = {
  type: 'map' | 'risk_table' | 'code_diff' | 'empty';
  title: string;
  state?: 'scanning' | 'extracted' | 'validated' | 'production';
  riskData?: { label: string; value: string; safe: boolean }[];
  codeDiff?: { file: string; additions: string[]; deletions: string[] };
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

// We will build the mock flow dynamically based on user input to look realistic
const generateFlow = (userInput: string): Omit<FlowEvent, 'id'>[] => {
  // Simple NLP extraction for hackathon demo realism
  const locationMatch = userInput.match(/in\s+([A-Z][a-zA-Z\s]+)/i) || userInput.match(/for\s+([A-Z][a-zA-Z\s]+)/i);
  const location = locationMatch ? locationMatch[1].trim() : "the target region";
  
  const featureMatch = userInput.match(/(?:update|analyze|extract|find|map)\s+(.*?)(?:\s+in|\s+for|$)/i);
  const feature = featureMatch ? featureMatch[1].trim() : "geospatial features";

  return [
    { agent: "Planner", action: "TASK_CREATED", detail: userInput, status: "complete" },
    { agent: "AuditCompliance", action: "AUDIT_LOGGED", detail: `Task instantiation recorded for ${location}`, status: "complete" },
    { agent: "Orchestrator", action: "TASK_ASSIGNED", detail: "Routed to @GeoIntelligenceAgent", status: "complete" },
    { agent: "GeoIntelligence", action: "DELIBERATING", detail: `Analyzing satellite imagery & extracting ${feature}...`, status: "thinking", artifact: { type: 'map', title: 'Satellite Processing', state: 'scanning' } },
    { agent: "GeoIntelligence", action: "GEO_FEATURE_EXTRACTED", detail: `42 ${feature} found in ${location}`, status: "complete", artifact: { type: 'map', title: 'Extracted Topology', state: 'extracted' } },
    { agent: "Validation", action: "DELIBERATING", detail: "Cross-referencing topology with baseline...", status: "thinking" },
    { agent: "Validation", action: "QA_RESULT", detail: "Failed: Missing critical metadata tags", status: "error", artifact: { type: 'risk_table', title: 'Validation Audit Report', riskData: [
      { label: 'Topology Check', value: 'Passed', safe: true },
      { label: 'CRS Mapping', value: 'Missing Data', safe: false },
      { label: 'Vector Count', value: '42 Features', safe: true }
    ]} },
    { agent: "Orchestrator", action: "WORKFLOW_ESCALATED", detail: "Re-routing task to @DeveloperAgent", status: "error" },
    { agent: "Developer", action: "DELIBERATING", detail: "Debugging metadata parsing logic...", status: "thinking" },
    { agent: "Developer", action: "SYSTEM_NOTIFICATION", detail: "Patch deployed: metadata-parser.js", status: "complete", artifact: { type: 'code_diff', title: 'Developer Code Patch', codeDiff: {
      file: 'metadata-parser.js',
      deletions: ['  return alignVectors(metadata);'],
      additions: ['  if (!metadata || !metadata.crs) throw new Error("Missing CRS mapping");', '  return alignVectors(metadata);']
    } } },
    { agent: "GeoIntelligence", action: "DELIBERATING", detail: "Re-extracting with patched parser...", status: "thinking" },
    { agent: "GeoIntelligence", action: "GEO_FEATURE_EXTRACTED", detail: `42 ${feature} (metadata fully attached)`, status: "complete", artifact: { type: 'map', title: 'Validated Vectors', state: 'validated' } },
    { agent: "Validation", action: "DELIBERATING", detail: "Re-running topology validation...", status: "thinking" },
    { agent: "Validation", action: "QA_RESULT", detail: "Passed: 100% compliance", status: "complete" },
    { agent: "Risk", action: "DELIBERATING", detail: "Reasoning over geospatial impact using Featherless AI...", status: "thinking" },
    { agent: "Risk", action: "RISK_ASSESSMENT", detail: "Confidence 0.98. Safe for production.", status: "complete", artifact: { type: 'risk_table', title: 'Final Risk Assessment', riskData: [
      { label: 'Security Impact', value: 'Low', safe: true },
      { label: 'Regulatory Risk', value: 'Negligible', safe: true },
      { label: 'Confidence Score', value: '98%', safe: true }
    ]} },
    { agent: "Orchestrator", action: "APPROVAL_GRANTED", detail: "Map Update Approved", status: "complete" },
    { agent: "Orchestrator", action: "MAP_UPDATE", detail: `PUBLISHED ${location} to Production`, status: "complete", artifact: { type: 'map', title: 'Production Tile Update', state: 'production' } },
    { agent: "QaTest", action: "SYSTEM_NOTIFICATION", detail: "Regression checks passed", status: "complete" },
    { agent: "Reporting", action: "REPORT_GENERATED", detail: `Mapping workflow for ${location} finalized successfully.`, status: "complete" },
  ];
};

export default function Home() {
  const [events, setEvents] = useState<FlowEvent[]>([]);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact>({ type: 'empty', title: 'Awaiting User Input...' });
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of feed
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setEvents([]);
    setCurrentArtifact({ type: 'empty', title: 'Waiting for Agent Artifacts...' });
    
    const flowData = generateFlow(inputValue);
    setInputValue("");
    
    const processFlow = async () => {
      let stepIndex = 0;
      let finalResult = "Task completed successfully.";
      
      // Try to fetch real results from the local LLM if available
      try {
        // Run the fetch in the background while the UI shows the agents thinking
        fetch('http://localhost:9999/qwen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: inputValue })
        }).then(res => res.json()).then(data => {
          if (data.content) finalResult = data.content;
        }).catch(() => {
            // fallback to llama if qwen fails
            fetch('http://localhost:9999/llama', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: inputValue })
            }).then(res => res.json()).then(data => {
              if (data.content) finalResult = data.content;
            }).catch(() => console.log('LLM fetch failed, using fallback'));
        });
      } catch (e) {
        console.log("Local LLM not reachable");
      }

      const processNextStep = () => {
        if (stepIndex >= flowData.length) {
          // Add the final real result
          setEvents(prev => [...prev, {
            id: stepIndex,
            agent: "Reporting",
            action: "REPORT_GENERATED",
            detail: "Final product generated based on agent consensus.",
            status: "complete",
            artifact: {
              type: 'code_diff',
              title: 'Final Intended Result',
              codeDiff: {
                file: 'result.md',
                additions: finalResult.split('\n'),
                deletions: []
              }
            }
          }]);
          
          setCurrentArtifact({
              type: 'code_diff',
              title: 'Final Intended Result',
              codeDiff: {
                file: 'result.md',
                additions: finalResult.split('\n'),
                deletions: []
              }
          });
          
          setIsProcessing(false);
          return;
        }
        
        const currentItem = flowData[stepIndex];
        const delay = currentItem.status === 'thinking' ? 2500 : 1500;

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
            newEvents.pop(); // Remove the "thinking" state
          }
          return [...newEvents, { ...currentItem, id: stepIndex }];
        });
        
        stepIndex++;
        setTimeout(processNextStep, delay);
      };

      processNextStep();
    };

    // Start the recursive flow
    processFlow();
  };

  const activeEvent = events.length > 0 ? events[events.length - 1] : null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black text-white p-4 md:p-8 font-sans selection:bg-purple-500/30 flex flex-col">
      
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">themap-co</h1>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Band Agentic Mesh</p>
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

      <main className="max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Left Column: Roster & State */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Currently Active</h2>
            {activeEvent && isProcessing ? (
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
              <div className="text-slate-500 text-sm text-center py-8 font-medium">System Idle. Waiting for human input.</div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex-1 overflow-y-auto min-h-0">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Agent Mesh Roster</h2>
            <ul className="space-y-2">
              {Object.keys(AGENT_COLORS).map(agent => {
                const isActive = activeEvent?.agent === agent && isProcessing;
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

        {/* Middle Column: Chat / Feed */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col h-full min-h-0">
          <div className="p-6 border-b border-white/10 shrink-0">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              Live Collaboration Feed
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {events.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <p>Type a task below to trigger the multi-agent mesh.</p>
              </div>
            )}
            
            {events.map((ev) => (
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
                  <div className="text-slate-300 text-xs leading-relaxed">
                    <span className="font-mono bg-white/10 px-1 py-0.5 rounded mr-2 font-bold">{ev.action}</span>
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
            <div ref={feedEndRef} />
          </div>

          {/* User Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a task for the agents (e.g. Update Gaborone CBD Roads)"
                className="w-full bg-white/5 border border-white/20 rounded-xl py-4 pl-4 pr-16 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                disabled={isProcessing}
              />
              <button 
                type="submit"
                disabled={isProcessing || !inputValue.trim()}
                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg px-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                SEND
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Visual Output Artifacts */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col h-full min-h-[500px] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="p-6 border-b border-white/10 bg-white/5 shrink-0">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Visual Outputs
            </h2>
          </div>
          <div className="flex-1 flex flex-col relative p-4 bg-black/20">
            <h3 className="text-white text-sm font-bold mb-3 tracking-wide">{currentArtifact.title}</h3>
            
            <div className="flex-1 rounded-xl overflow-hidden flex flex-col relative">
              
              {currentArtifact.type === 'empty' && (
                <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center p-6 text-center">
                  <span className="text-slate-500 text-sm font-medium">Task output will render visually here...</span>
                </div>
              )}

              {/* MAP COMPONENT */}
              {currentArtifact.type === 'map' && (
                <div className="w-full h-full relative bg-slate-900 rounded-xl border border-white/10 shadow-inner">
                  {/* Grid Background */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  
                  {/* Scanning Animation */}
                  {currentArtifact.state === 'scanning' && (
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10 pointer-events-none">
                      <div className="w-full h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-bounce opacity-70"></div>
                    </div>
                  )}

                  {/* SVG Nodes */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M20,80 L40,40 L70,50 L90,20" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" className={currentArtifact.state === 'scanning' ? 'animate-pulse' : ''} />
                    {(currentArtifact.state === 'extracted' || currentArtifact.state === 'validated' || currentArtifact.state === 'production') && (
                      <path d="M10,90 L30,60 L60,70 L85,30" fill="none" stroke={currentArtifact.state === 'production' ? '#3b82f6' : '#10b981'} strokeWidth="1.5" className="animate-in fade-in duration-700" />
                    )}
                    
                    <circle cx="30" cy="60" r="2" fill="#10b981" className="animate-pulse" />
                    <circle cx="30" cy="60" r="1.5" fill="#fff" />
                    <circle cx="60" cy="70" r="2" fill="#10b981" />
                    <circle cx="60" cy="70" r="1.5" fill="#fff" />
                    <circle cx="85" cy="30" r="2" fill="#ef4444" className="animate-bounce" />
                    <circle cx="85" cy="30" r="1" fill="#fff" />
                  </svg>

                  {/* HUD */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md p-3 rounded-lg text-xs text-emerald-400 font-mono border border-emerald-500/30">
                    <div className="flex justify-between"><span>LAT:</span> <span className="text-white">-24.653</span></div>
                    <div className="flex justify-between"><span>LNG:</span> <span className="text-white">25.918</span></div>
                    <div className="mt-2 pt-2 border-t border-emerald-500/30 font-bold text-center">
                      {currentArtifact.state === 'scanning' && <span className="text-blue-400">SCANNING...</span>}
                      {currentArtifact.state === 'extracted' && <span className="text-yellow-400">UNVALIDATED VECTORS</span>}
                      {currentArtifact.state === 'validated' && <span className="text-emerald-400">VECTORS VALIDATED</span>}
                      {currentArtifact.state === 'production' && <span className="text-purple-400">PRODUCTION DEPLOYED</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* RISK / VALIDATION TABLE COMPONENT */}
              {currentArtifact.type === 'risk_table' && currentArtifact.riskData && (
                <div className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                  {currentArtifact.riskData.map((item, i) => (
                    <div key={i} className="bg-black/50 border border-white/5 rounded-lg p-3 flex justify-between items-center animate-in fade-in zoom-in-95 duration-300" style={{ animationDelay: `${i * 150}ms` }}>
                      <span className="text-slate-300 text-sm font-medium">{item.label}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.safe ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                  
                  {!currentArtifact.riskData.every(d => d.safe) && (
                    <div className="mt-auto bg-red-950/50 border border-red-500/50 p-3 rounded-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      <span className="text-red-400 text-xs font-bold">AUTOMATIC REJECTION</span>
                    </div>
                  )}
                  {currentArtifact.riskData.every(d => d.safe) && (
                    <div className="mt-auto bg-emerald-950/50 border border-emerald-500/50 p-3 rounded-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="text-emerald-400 text-xs font-bold">ALL CHECKS PASSED</span>
                    </div>
                  )}
                </div>
              )}

              {/* CODE DIFF COMPONENT */}
              {currentArtifact.type === 'code_diff' && currentArtifact.codeDiff && (
                <div className="flex-1 bg-[#1e1e1e] border border-white/10 rounded-xl flex flex-col overflow-hidden">
                  <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-black/50 shrink-0">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span className="text-slate-300 text-xs font-mono">{currentArtifact.codeDiff.file}</span>
                  </div>
                  <div className="p-4 font-mono text-xs leading-relaxed overflow-y-auto">
                    {currentArtifact.codeDiff.deletions.map((line, i) => (
                      <div key={'del'+i} className="text-red-400 bg-red-950/30 px-2 -mx-4 flex">
                        <span className="w-6 text-red-500/50 select-none">-</span>
                        <span>{line}</span>
                      </div>
                    ))}
                    {currentArtifact.codeDiff.additions.map((line, i) => (
                      <div key={'add'+i} className="text-emerald-400 bg-emerald-950/30 px-2 -mx-4 flex">
                        <span className="w-6 text-emerald-500/50 select-none">+</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
