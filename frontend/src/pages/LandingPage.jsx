import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, BrainCircuit, Mic, FileText, UserCheck, Activity, Brain, ShieldCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="flex flex-col animate-in fade-in duration-1000 bg-white">
      
      {/* 
        ========================================================================================
        HERO SECTION
        ========================================================================================
      */}
      <section className="relative pt-32 pb-48 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-gradient-to-b from-blue-50/80 via-white to-white rounded-[100%] opacity-80 pointer-events-none blur-3xl z-[-1]" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-violet-200/40 rounded-full blur-[80px] pointer-events-none z-[-1]" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none z-[-1]" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 flex flex-col gap-10 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/50 w-fit mx-auto lg:mx-0 shadow-sm"
            >
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-xs font-black text-blue-700 uppercase tracking-widest leading-none pt-0.5">Government-Grade Intelligence</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-[76px] font-black text-slate-900 leading-[1.05] tracking-tight"
            >
              Transforming <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Police Intelligence</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              Experience the billion-dollar startup platform for citizen safety. We build the infrastructure for a smarter, more reliable civic response.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-4 lg:justify-start justify-center"
            >
              <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1">
                Report Incident <ArrowRight size={22} strokeWidth={2.5} />
              </Link>
              <Link to="/features" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 flex items-center justify-center">
                Explore Features
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-2xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-violet-50 rounded-[4rem] transform rotate-3 scale-105 -z-10 shadow-lg" />
            <img 
              src="/images/citizen_ai_reporting_1774207794930.png" 
              alt="Citizen reporting complaint to AI" 
              className="w-full h-auto object-cover rounded-[4rem] shadow-2xl shadow-blue-900/20 border border-white/50 bg-white"
            />
          </motion.div>
        </div>
      </section>

      {/* Trust Stats / Metrics Strip */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
             {[
               { val: '2s', label: 'Processing Speed' },
               { val: '100%', label: 'Transparency' },
               { val: '24/7', label: 'System Uptime' },
               { val: 'Encryption', label: 'Military-Grade' }
             ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-2">
                   <h4 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{stat.val}</h4>
                   <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{stat.label}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Grid Previews for Separate Pages */}
      <section className="py-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-24 max-w-3xl mx-auto flex flex-col gap-6">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Navigating the <span className="text-blue-600">Ecosystem</span></h2>
            <p className="text-xl text-slate-500 font-medium">Dive into the deep technical layers and procedural workflows that power our intelligence engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'Capabilities', path: '/features', desc: 'Detailed breakdown of our AI-driven incident classification and priority detection modules.', icon: <Sparkles size={32} /> },
              { title: 'System Workflow', path: '/how-it-works', desc: 'End-to-end procedural flow from raw citizen input to official legal FIR documentation.', icon: <Activity size={32} /> },
              { title: 'AI Intelligence', path: '/ai-intelligence', desc: 'The architectural foundation of our neural networks and real-time processing clusters.', icon: <Brain size={32} /> }
            ].map((card, i) => (
              <Link 
                key={i} 
                to={card.path}
                className="group p-12 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-3 flex flex-col items-center text-center gap-8 relative overflow-hidden"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {card.icon}
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">{card.desc}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all mt-4">
                   View Module <ArrowRight size={18} />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl -z-10" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl bg-slate-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-3xl text-center flex flex-col items-center gap-10">
           <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/30 blur-[120px] rounded-full pointer-events-none" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/30 blur-[120px] rounded-full pointer-events-none" />
           <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight relative z-10 leading-none">Ready for the modern era of safety?</h2>
           <p className="text-xl text-slate-400 font-medium max-w-2xl relative z-10 leading-relaxed">Join thousands of citizens and officers in an AI-first public safety infrastructure.</p>
           <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 w-full justify-center relative z-10">
              <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all duration-300">
                Register Platform ID
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all duration-300">
                Log in to Node
              </Link>
           </div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 mt-12 bg-white">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <Shield size={24} className="text-blue-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Citizen Care<span className="text-blue-600 font-extrabold pb-0.5">.</span>AI</span>
           </div>
           <p className="text-sm font-medium text-slate-400">&copy; {new Date().getFullYear()} AI Police Intelligence System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
