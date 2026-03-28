import React from 'react';
import { Brain, Sparkles, BrainCircuit, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AIIntelligencePage = () => {
  return (
    <div className="pt-32 pb-24 bg-white animate-in fade-in duration-700">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-20 mb-32">
          <div className="flex-1 flex flex-col gap-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 w-fit text-blue-600 text-[10px] font-black uppercase tracking-widest">
              Neural Network Architecture
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Built with Advanced <br /> <span className="text-blue-600">AI Intelligence</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl text-slate-500 font-medium leading-relaxed">
              Our proprietary model doesn't just store data; it understands context, intent, and severity in real-time.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-6 mt-4">
              {[
                { title: 'Natural Language Processing', desc: 'Understands vernacular phrasing and colloquial terminology out-of-the-box in multiple languages.' },
                { title: 'Real-Time Data Processing', desc: 'Instantly identifies critical threat vectors hidden within citizen statements using semantic analysis.' },
                { title: 'Smart Decision Making', desc: 'Assists officers with intelligent recommendations for rapid dispatch based on historical severity.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="mt-1 bg-blue-50 p-2 rounded-xl text-blue-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="flex-1 w-full max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-100 to-blue-50 rounded-[4rem] transform -rotate-3 scale-105 -z-10 shadow-lg transition-transform duration-500 group-hover:rotate-0" />
              <img 
                src="/images/ai_fir_transformation_1774207849035.png" 
                alt="AI Intelligence transforming data" 
                className="w-full h-auto object-cover rounded-[4rem] shadow-2xl border border-white/60 bg-white relative z-10"
              />
              
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 flex flex-col gap-4 z-20 animate-bounce delay-150 max-w-xs">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Brain size={28} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 tracking-tight">NLP Engine</span>
                    <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">Active Processing</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-24 bg-slate-50 rounded-[4rem] border border-slate-200/50 flex flex-col items-center text-center gap-10">
           <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Trust the data.</h2>
           <p className="text-xl text-slate-500 font-medium max-w-2xl px-6">Our AI is built on private, secure infrastructure to ensure citizen confidentiality and legal integrity.</p>
           <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center px-6">
              <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all duration-300">
                Create Secure Account
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all duration-300">
                Log in to Portal
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntelligencePage;
