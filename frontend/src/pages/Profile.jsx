import React, { useState } from 'react';
import { User, Mail, Shield, Bell, Key, LogOut, Camera, CheckCircle2, Phone, Fingerprint, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Security', 'Preferences', 'Records'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
      <header className="header-box flex flex-col md:flex-row md:items-end justify-between gap-6 relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 -mr-20 -mt-20 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Identity Hub: Profile Oversight</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="status-pulse bg-primary-500" style={{ '--pulse-color': 'rgba(59, 130, 246, 0.5)' }}></div>
             <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">{user?.name} Identity</h1>
          </div>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Synthesizing personal credentials and security authorization metrics.</p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <span className="px-6 py-3 bg-white/5 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 shadow-xl backdrop-blur-md">
            Verified UID: {user?._id?.slice(-8).toUpperCase()}
          </span>
        </div>
      </header>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 w-max rounded-2xl">
         {tabs.map((tab) => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95
               ${activeTab === tab ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-900'}
             `}
           >
             {tab}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Card Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="card p-10 flex flex-col items-center text-center gap-8 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-500"></div>
              
              <div className="relative mt-2">
                 <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 ring-1 ring-slate-100 shadow-inner flex items-center justify-center text-6xl font-black text-slate-900 overflow-hidden transform group-hover:rotate-2 transition-transform duration-500">
                    {user?.name?.charAt(0)}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                       <Camera size={28} className="text-white" />
                    </div>
                 </div>
                 <motion.div 
                   animate={{ scale: [1, 1.1, 1] }} 
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl border-4 border-white shadow-xl"
                 >
                    <CheckCircle2 size={18} />
                 </motion.div>
              </div>
              
              <div className="flex flex-col gap-3 px-4">
                 <div className="flex items-center justify-center gap-3">
                    <div className="status-pulse bg-primary-600" style={{ '--pulse-color': 'rgba(37, 99, 235, 0.4)' }}></div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">{user?.name}</h2>
                 </div>
                 <div className="flex items-center justify-center gap-2">
                    <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.3em] bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100/50">
                       {user?.role} AUTHORITY
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                       LVL 14
                    </span>
                 </div>
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              <div className="flex flex-col gap-5 w-full text-left">
                 <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Index</span>
                    <span className="text-[11px] font-black text-slate-900 tracking-widest uppercase">92.4% Optimal</span>
                 </div>
                 <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      className="h-full bg-slate-900 rounded-full shadow-lg"
                    ></motion.div>
                 </div>
              </div>
           </div>

           <motion.div 
             whileHover={{ y: -5 }}
             className="card p-8 bg-slate-900 text-white flex flex-col gap-5 relative overflow-hidden rounded-[3rem] border-none shadow-4xl shadow-slate-900/20"
           >
                <Fingerprint size={80} className="text-primary-500 opacity-10 absolute -right-4 -top-4 rotate-12" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-10 h-10 bg-white/10 rounded-[1rem] flex items-center justify-center border border-white/10">
                      <Shield size={20} className="text-primary-400" />
                   </div>
                   <span className="text-xs font-black uppercase tracking-[0.2em]">Security Protocol</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed relative z-10 opacity-70">
                   Synthesizing biometric authentication layers for high-impact report authorization.
                </p>
                <button className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] hover:text-white transition-all text-left relative z-10">
                   INITIALIZE SYNC &rarr;
                </button>
           </motion.div>
        </div>

        {/* Dynamic Detail Sections */}
        <div className="lg:col-span-8 flex flex-col gap-8">
           <div className="card p-10 lg:p-14 flex flex-col gap-12 bg-white/80 backdrop-blur-xl border border-white shadow-3xl shadow-slate-200/50 rounded-[4rem]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-12">
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{activeTab} Parameters</h3>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-3.5">System sector configuration node.</p>
                 </div>
                 <button className="text-[10px] font-black text-rose-600 tracking-[0.3em] uppercase py-4 px-8 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all active:scale-95 shadow-lg shadow-rose-200/20 border border-rose-100">
                    Lock Sector
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {[
                   { icon: <User size={16} />, label: 'Legal Identifier', val: user?.name },
                   { icon: <Mail size={16} />, label: 'Access Point', val: user?.email },
                   { icon: <Phone size={16} />, label: 'Relay Protocol', val: '+91 990 234 xxxx' },
                   { icon: <Shield size={16} />, label: 'Security Clearance', val: 'Level IV - Strategic Citizen' }
                 ].map((field, i) => (
                   <div key={i} className="flex flex-col gap-3 group">
                      <div className="flex items-center gap-2 text-slate-400">
                         <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            {field.icon}
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em]">{field.label}</span>
                      </div>
                      <div className="text-xs font-black text-slate-800 bg-slate-50 px-8 py-6 rounded-[2rem] border border-slate-50 group-hover:border-primary-100 group-hover:bg-white transition-all shadow-inner tracking-[0.15em] flex items-center justify-between">
                         {field.val}
                         <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary-400" />
                      </div>
                   </div>
                 ))}
              </div>

              <div className="flex flex-col gap-10 pt-10 border-t border-slate-50">
                 <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Operational Telemetry</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active mission debrief and dispatch relays.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Deployment Relay', desc: 'Critical SMS dispatch notifications', active: true },
                      { label: 'Archive Pulse', desc: 'Sector-wide infrastructure logs', active: false }
                    ].map((pref, i) => (
                      <div key={i} className="flex flex-col gap-4 p-8 bg-slate-50 rounded-[3rem] border border-slate-50 transition-all hover:bg-white hover:border-slate-100 group">
                         <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{pref.label}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{pref.desc}</span>
                         </div>
                         <button className={`w-14 h-7 rounded-full relative transition-all shadow-inner border ${pref.active ? 'bg-slate-900 border-slate-900' : 'bg-slate-200 border-slate-300'}`}>
                            <div className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-white shadow-xl transition-all ${pref.active ? 'left-8' : 'left-1'}`}></div>
                         </button>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex items-center justify-end gap-8 pt-6">
                 <button className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Abort Changes</button>
                 <button className="bg-slate-900 text-white py-6 px-16 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.4em] hover:bg-primary-600 shadow-[0_20px_50px_rgba(2,6,23,0.1)] active:scale-95 transition-all">Commit Protocol</button>
              </div>
           </div>

           <motion.div 
             whileHover={{ x: 5 }}
             className="flex items-center justify-between p-10 bg-rose-50 rounded-[3rem] border border-rose-100 gap-8 group hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-xl shadow-rose-200/20 relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-8 relative z-10">
                 <div className="p-5 bg-white rounded-[1.5rem] shadow-sm text-rose-500 group-hover:bg-white group-hover:scale-110 transition-all">
                    <LogOut size={28} />
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-xs font-black uppercase tracking-[0.2em] group-hover:text-white">Terminate Authentication</span>
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest group-hover:text-white/70">Securely finalize session and cycle encryption keys</span>
                 </div>
              </div>
              <ArrowRight size={24} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 relative z-10" />
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
