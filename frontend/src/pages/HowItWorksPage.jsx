import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, BrainCircuit, Mic, FileText, UserCheck, Activity, Brain, ShieldCheck, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
  const steps = [
    { title: 'Submit Complaint', desc: 'Citizen inputs details via text or voice in their native language.', icon: <Mic className="text-blue-500" /> },
    { title: 'AI Processes Data', desc: 'System parses, translates, and structures the incoming data stream.', icon: <Brain className="text-violet-500" /> },
    { title: 'Admin Reviews', desc: 'Automated triage and risk-level classification takes place instantly.', icon: <ShieldCheck className="text-emerald-500" /> },
    { title: 'Officer Assigned', desc: 'Smart dispatch allocates to the most appropriate precinct and officer.', icon: <UserCheck className="text-amber-500" /> },
    { title: 'FIR Generated', desc: 'AI drafts official legal documentation ready for officer endorsement.', icon: <FileText className="text-rose-500" /> },
    { title: 'Investigation', desc: 'Actionable intelligence is sent to the field for rapid response.', icon: <Activity className="text-blue-600" /> }
  ];

  return (
    <div className="pt-32 pb-24 bg-white animate-in fade-in duration-700">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest">
            The Workflow
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            An End-to-End <br /> <span className="text-blue-600">Workflow Solution</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xl text-slate-500 font-medium leading-relaxed">
            Seamlessly bridging the gap between incident occurrence and legal resolution through our intelligent system architecture.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative pb-20">
          <div className="hidden lg:block absolute top-[50%] left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-200 to-blue-500/0 -z-10" />
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-8 bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-3xl font-black relative overflow-hidden group-hover:scale-110 transition-transform">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">{step.icon}</span>
                <span className="absolute top-1 right-2 text-[10px] text-slate-300 font-black">{i + 1}</span>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{step.title}</h4>
                <p className="text-slate-500 font-semibold leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 w-full flex flex-col md:flex-row items-center gap-16 p-10 md:p-20 bg-blue-50 rounded-[3rem] border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 blur-[100px] rounded-full" />
          <div className="flex-1 flex flex-col gap-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Ready to see it in action?</h2>
            <p className="text-xl text-slate-600 font-medium">Connect with local precincts and experience modern public safety.</p>
            <Link to="/register" className="w-fit px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 mt-4">
              Get Started Now <ArrowRight size={22} />
            </Link>
          </div>
          <div className="flex-1 w-full max-w-lg relative z-10">
             <img src="/images/officer_ai_dashboard_1774207821043.png" alt="Officer Dashboard" className="w-full h-auto rounded-3xl shadow-2xl border border-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
