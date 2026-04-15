import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Cpu, Zap, Globe, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white selection:bg-regal-gold/30 selection:text-regal-gold">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-regal-red via-regal-gold to-regal-green p-[2px]">
              <div className="w-full h-full rounded-[10px] bg-[#0F172A] flex items-center justify-center">
                <span className="font-bold text-xl tracking-tighter">RA</span>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight">Ras Ali <span className="text-regal-gold text-xs uppercase tracking-widest ml-1 font-medium">Labs</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#vision" className="hover:text-white transition-colors">Vision</a>
            <a href="#process" className="hover:text-white transition-colors">Process</a>
          </div>

          <Link to="/dashboard" className="px-5 py-2.5 rounded-full bg-white text-[#0F172A] text-sm font-bold hover:bg-regal-gold hover:text-white transition-all duration-300 flex items-center gap-2">
            Enter Platform <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Image */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/ras_ali_hero_bg_1776174839803.png"
            alt="Hero Background"
            className="w-full h-full object-cover scale-110 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-transparent to-[#0F172A]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-regal-gold text-[10px] font-bold uppercase tracking-widest mb-8">
              <Sparkles className="w-3 h-3" /> Next Generation Agentic Workflow
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              Architecting <br />
              <span className="regal-gradient">Sentient Systems.</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
              Ras Ali Labs is the world's most advanced autonomous agentic ecosystem. Empowering enterprise logic with a self-evolving boardroom of specialized AI agents.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard" className="px-8 py-4 rounded-2xl bg-gradient-to-tr from-regal-red to-regal-gold text-white font-bold text-lg hover:shadow-2xl hover:shadow-regal-red/20 transition-all duration-300 flex items-center gap-3 active:scale-95">
                Launch Dashboard <Bot className="w-6 h-6" />
              </Link>
              <a href="#vision" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300">
                Explore Vision
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Logos Bar */}
      <div className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="font-bold text-2xl tracking-tighter">OLLAMA</span>
            <span className="font-bold text-2xl tracking-tighter">GEMINI</span>
            <span className="font-bold text-2xl tracking-tighter">GROQ</span>
            <span className="font-bold text-2xl tracking-tighter">LLAMA 3</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Engineered for <span className="text-regal-green">Autonomy.</span></h2>
            <p className="text-zinc-400 text-lg max-w-2xl">Our platform leverages the latest in Agentic Reasoning to transform static tasks into dynamic, multi-stage executions.</p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Cpu className="w-8 h-8 text-regal-red" />,
                title: "Cognitive Boardroom",
                desc: "A collaborative space where CEO and CFO agents plan, debate, and authorize complex project workflows."
              },
              {
                icon: <Zap className="w-8 h-8 text-regal-gold" />,
                title: "Flash-Speed Execution",
                desc: "Sub-second reasoning cycles powered by advanced MoE models and highly optimized vector backends."
              },
              {
                icon: <Shield className="w-8 h-8 text-regal-green" />,
                title: "Secure Orchestration",
                desc: "Enterprise-grade sandboxing for all agentic actions, ensuring data integrity and ethical compliance."
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 group cursor-default shadow-lg hover:shadow-regal-gold/5"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 bg-gradient-to-b from-[#0F172A] to-[#0D1117]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card p-12 md:p-20 rounded-[3rem] relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-regal-red/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-regal-green/10 blur-[100px] rounded-full"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">Beyond Mere <br /><span className="text-regal-gold">Automation.</span></h2>
                <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
                  <p>Ras Ali Labs isn't just a tool; it's a digital workforce that thinks before it acts. Every task is analyzed for budget impact, tactical efficiency, and strategic alignment.</p>
                  <p>We are building the first persistent agentic environment where AI agents remember past lessons and refine their strategies over time.</p>
                </div>
                <div className="mt-12 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(x => (
                      <div key={x} className="w-12 h-12 rounded-full border-2 border-[#0F172A] bg-zinc-800 flex items-center justify-center text-xs font-bold">
                        {x === 4 ? `+12` : `A${x}`}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-zinc-400">
                    Trusted by <span className="text-white">500+</span> Agentic Developers
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-tr from-regal-red/20 to-regal-gold/20 flex items-center justify-center p-8 border border-white/5">
                  <div className="w-full h-full rounded-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 flex flex-col p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-auto text-[10px] text-zinc-500 font-mono">system.reasoning_module</div>
                    </div>
                    <div className="space-y-4 font-mono text-xs">
                      <div className="text-zinc-500">{" > "} Initiating Executive Boardroom</div>
                      <div className="text-regal-gold">{" > "} CFO: Analyzing budget constraints... ($1,200 OK)</div>
                      <div className="text-regal-green">{" > "} CEO: Task delegated to Research_Agent_01</div>
                      <div className="flex items-center gap-2">
                        <span className="text-regal-red">{" > "}</span>
                        <span className="w-2 h-4 bg-regal-red animate-pulse"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-8">Ready to evolve your <br /><span className="regal-gradient">Digital DNA?</span></h2>
          <p className="text-xl text-zinc-400 mb-12">Join the Ras Ali ecosystem today and experience the future of autonomous work.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full md:w-auto px-10 py-5 rounded-2xl bg-white text-[#0F172A] font-bold text-xl hover:bg-regal-gold hover:text-white transition-all duration-300">
              Get Started Now
            </Link>
            <Link to="/chat" className="w-full md:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 transition-all duration-300">
              Talk to AI
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl tracking-tight">Ras Ali <span className="text-zinc-500 font-normal">Labs</span></span>
          </div>
          <div className="text-sm text-zinc-500">
            © 2026 Ras Ali Labs. Built for the era of Autonomy.
          </div>
          <div className="flex items-center gap-6 text-zinc-500">
            <Globe className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Bot className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};
