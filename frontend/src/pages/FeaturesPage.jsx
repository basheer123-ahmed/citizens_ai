import React from 'react';
import { Mic, BrainCircuit, FileText, UserCheck, Sparkles, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
  const features = [
    { icon: <Mic size={24} />, title: 'Multilingual Complaint Input', description: 'Log complaints in your native language with real-time translation and voice-to-text processing for truly inclusive civic access.' },
    { icon: <BrainCircuit size={24} />, title: 'AI Classification & Priority Detection', description: 'Advanced NLP automatically categorizes incidents and predicts priority levels for immediate response dispatching.' },
    { icon: <FileText size={24} />, title: 'AI FIR Generation', description: 'Transform raw citizen statements into legally structured, ready-to-file First Information Reports instantly using verified legal templates.' },
    { icon: <UserCheck size={24} />, title: 'Smart Officer Assignment', description: 'Algorithmically match cases to the most suitable officers based on workload, location, specialized expertise, and performance metrics.' },
    { icon: <Sparkles size={24} />, title: 'AI Case Assistant', description: 'An intelligent copilot for officers to quickly query case details, summarize evidence, and generate automated alerts for critical patterns.' },
    { icon: <Activity size={24} />, title: 'Real-Time Complaint Tracking', description: 'Transparent, end-to-end visibility for citizens to monitor their case status and investigation updates with blockchain-style immutability.' }
  ];

  return (
    <div className="pt-32 pb-24 bg-white animate-in fade-in duration-700">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest"
          >
            Capabilities
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight"
          >
            Breaking Traditional <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Police Boundaries</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 font-medium leading-relaxed"
          >
            Equipping citizens and law enforcement with next-generation analytical power to build a safer, more responsive community.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col gap-6 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                {f.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.description}</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-12 md:p-20 rounded-[3rem] bg-slate-900 text-white flex flex-col items-center text-center gap-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 blur-[120px] rounded-full pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-black tracking-tight relative z-10">Experience the difference.</h2>
          <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all duration-300 transform hover:-translate-y-1 relative z-10 flex items-center justify-center gap-2">
            Start Reporting Today <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
