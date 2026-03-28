import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, ShieldCheck, CheckCircle2, ChevronRight, Zap, Info, ArrowUpRight, ArrowRight, Activity, Users, Globe, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE from '../config/api';

const Feedback = ({ user }) => {
  // Platform Feedback State
  const [platformRating, setPlatformRating] = useState(0);
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [submittingPlatform, setSubmittingPlatform] = useState(false);
  const [platformDone, setPlatformDone] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Global Pulse State
  const [globalFeedbacks, setGlobalFeedbacks] = useState([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);

  // Officer Feedback State
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [selectedComp, setSelectedComp] = useState(null);
  const [officerRating, setOfficerRating] = useState(0);
  const [officerFeedback, setOfficerFeedback] = useState('');
  const [submittingOfficer, setSubmittingOfficer] = useState(false);
  const [loadingComps, setLoadingComps] = useState(false);

  useEffect(() => {
    fetchResolved();
    fetchGlobalFeedbacks();
  }, []);

  const fetchResolved = async () => {
    setLoadingComps(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE}/api/complaints/my`, config);
      const unrated = data.filter(c => (c.status === 'Resolved' || c.status === 'Closed') && !c.rating);
      setResolvedComplaints(unrated);
    } catch (err) {
      console.error('Buffer read error:', err);
    } finally {
      setLoadingComps(false);
    }
  };

  const fetchGlobalFeedbacks = async () => {
    setLoadingGlobal(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE}/api/complaints/platform-feedback`, config);
      setGlobalFeedbacks(data);
    } catch (err) {
      console.error('Failure to retrieve global pulse:', err);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const handlePlatformSubmit = async (e) => {
    e.preventDefault();
    if (platformRating === 0 || remarks.trim() === '') return;

    setSubmittingPlatform(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_BASE}/api/complaints/platform-feedback`, {
        rating: platformRating,
        factors: selectedFactors,
        remarks: remarks
      }, config);
      setPlatformDone(true);
      fetchGlobalFeedbacks();
    } catch (err) {
      console.error('Platform feedback transmission failure:', err);
    } finally {
      setSubmittingPlatform(false);
    }
  };

  const handleOfficerSubmit = async () => {
    if (!selectedComp || officerRating === 0) return;
    setSubmittingOfficer(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/api/complaints/${selectedComp._id}/rate`, {
        rating: officerRating,
        feedback: officerFeedback
      }, config);
      setSelectedComp(null);
      setOfficerRating(0);
      setOfficerFeedback('');
      fetchResolved();
    } catch (err) {
      console.error('Transmission failed:', err);
    } finally {
      setSubmittingOfficer(false);
    }
  };

  const factorList = [
    'Navigation Interface', 'Officer Communication', 
    'Data Visualization', 'Resolution Speed', 
    'Mobile Experience', 'System Reliability'
  ];

  const getRatingText = (r) => {
    const labels = ['', 'Operational Failure', 'Sub-optimal', 'Satisfactory', 'High Grade', 'Elite Tier'];
    return labels[r] || 'Initialize Rating';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
      <header className="header-box flex flex-col md:flex-row md:items-end justify-between gap-6 relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 -mr-20 -mt-20 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Assessment Terminal: Echo System</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">Experience Intelligence</h1>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Synthesizing platform engagement metrics for procedural optimization.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <span className="flex items-center gap-1.5 px-6 py-3 bg-white/5 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl backdrop-blur-md">
             Active Assessment Protocol: FB-{new Date().getFullYear()}-PR
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Platform Feedback & Global Feed */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          <div className="card p-10 md:p-14 relative overflow-hidden bg-white/90 backdrop-blur-xl shadow-3xl shadow-slate-200/50 rounded-[3rem] border-none">
            <AnimatePresence mode="wait">
              {!platformDone ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col gap-12"
                >
                  <div className="flex flex-col gap-3 px-1">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Platform Diagnostics</h2>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Quantify engagement metrics for the municipal portal.</p>
                  </div>

                  <form className="flex flex-col gap-10" onSubmit={handlePlatformSubmit}>
                    <div className="flex flex-col gap-5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Satisfaction Vector</label>
                      <div className="flex items-center gap-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button 
                            key={s} 
                            type="button"
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setPlatformRating(s)}
                            className={`p-4 rounded-3xl transition-all duration-300 relative group
                              ${(hoverRating || platformRating) >= s ? 'bg-primary-50 text-gold-500 scale-105' : 'bg-slate-50 text-slate-200'}
                            `}
                          >
                            <Star size={32} className={(hoverRating || platformRating) >= s ? "fill-primary-500 text-primary-500" : ""} />
                            {(hoverRating || platformRating) === s && (
                               <motion.div layoutId="rating-pulse" className="absolute inset-0 rounded-3xl border-2 border-primary-500/30 animate-ping opacity-20"></motion.div>
                            )}
                          </button>
                        ))}
                        <div className="ml-6 flex flex-col">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                           <span className="text-xs font-black text-primary-600 uppercase tracking-tight">
                             {getRatingText(hoverRating || platformRating)}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tactical Factors</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {factorList.map((f, i) => (
                          <button 
                            key={i} 
                            type="button"
                            onClick={() => setSelectedFactors(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                            className={`p-4 rounded-2xl text-left transition-all border-2 flex items-center gap-4
                              ${selectedFactors.includes(f) ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-200' : 'bg-white border-slate-50 text-slate-500 hover:border-primary-100'}
                            `}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedFactors.includes(f) ? 'bg-white/20' : 'bg-slate-100'}`}>
                              {selectedFactors.includes(f) && <CheckCircle2 size={14} />}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-tight">{f}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Detailed Analysis</label>
                      <textarea 
                        className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-xs font-bold uppercase tracking-widest focus:ring-4 focus:ring-primary-500/5 focus:border-primary-300 outline-none min-h-[160px] transition-all placeholder:text-slate-300 shadow-inner"
                        placeholder="ENTER ENCRYPTED ASSESSMENT DATA..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={platformRating === 0 || remarks.trim() === '' || submittingPlatform}
                      className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-primary-600 hover:shadow-3xl hover:shadow-primary-500/30 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-slate-200"
                    >
                      {submittingPlatform ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                        <>Commit Assessment <Send size={18} /></>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center gap-8"
                >
                  <div className="w-24 h-24 bg-emerald-100 rounded-[3rem] flex items-center justify-center text-emerald-600 shadow-2xl shadow-emerald-200">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-black text-slate-900">Analysis Logs Encrypted</h2>
                    <p className="text-sm text-slate-500 font-medium">Your platform metrics have been integrated into the central engineering queue.</p>
                  </div>
                  <button onClick={() => setPlatformDone(false)} className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">Revise Metrics</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-6 px-4 auto-rows-max">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Live Assessment Pulse</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingGlobal ? (
                <div className="col-span-2 flex justify-center py-10"><div className="w-6 h-6 border-3 border-slate-100 border-t-primary-500 rounded-full animate-spin"></div></div>
              ) : globalFeedbacks.length > 0 ? (
                globalFeedbacks.map((f, i) => (
                  <motion.div 
                    key={f._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card p-6 bg-white flex flex-col gap-4 rounded-[2rem] border-none shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          {f.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{f.userId?.name || 'Anonymous User'}</span>
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verified Citizen</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, star) => (
                          <div key={star} className={`w-1.5 h-1.5 rounded-full ${star < f.rating ? 'bg-amber-400' : 'bg-slate-100'}`}></div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">"{f.remarks}"</p>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                      {f.factors.slice(0, 2).map((fac, j) => (
                        <span key={j} className="text-[8px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase tracking-widest">{fac}</span>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-10 text-center text-slate-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-50 rounded-[2rem]">No recent pulse reflections found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Officer Feedback & Support */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Officer Review Section */}
          <div className="card p-10 md:p-12 rounded-[3.5rem] border-none shadow-3xl bg-white shadow-slate-200/50 flex flex-col gap-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center border border-emerald-100 shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Officer Duty Audit</h3>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full mt-2 w-max">Mission Closure Hub</span>
              </div>
            </div>

            {loadingComps ? (
              <div className="flex justify-center p-10"><div className="w-6 h-6 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div></div>
            ) : resolvedComplaints.length > 0 ? (
              <div className="flex flex-col gap-6">
                {!selectedComp ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest px-1">Detected <span className="text-emerald-600">{resolvedComplaints.length} pending</span> duty audits.</p>
                    {resolvedComplaints.map(c => (
                      <button 
                        key={c._id}
                        onClick={() => setSelectedComp(c)}
                        className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] hover:bg-emerald-50 hover:border-emerald-100 border-2 border-transparent transition-all group scale-100 hover:scale-[1.02] shadow-sm"
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-xs font-black font-mono text-slate-900 tracking-widest">{c.complaintId}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.category} PROTOCOL</span>
                        </div>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:rotate-45 transition-all">
                           <ArrowUpRight size={20} />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-6 bg-slate-50 p-6 rounded-[2rem] border-2 border-emerald-100">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                      <span className="text-xs font-black font-mono text-slate-900">{selectedComp.complaintId}</span>
                      <button onClick={() => setSelectedComp(null)} className="text-[10px] font-bold uppercase text-slate-400 hover:text-rose-500">Cancel</button>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Officer Conduct Score</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button 
                            key={s}
                            onClick={() => setOfficerRating(s)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${officerRating >= s ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-200'}`}
                          >
                            <Star size={18} className={officerRating >= s ? 'fill-white' : ''} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mission debrief</label>
                      <textarea 
                        className="w-full p-4 bg-white border border-emerald-50 rounded-2xl text-[11px] font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:italic"
                        placeholder="How was the resolution speed?"
                        value={officerFeedback}
                        onChange={(e) => setOfficerFeedback(e.target.value)}
                      />
                    </div>

                    <button 
                      onClick={handleOfficerSubmit}
                      disabled={submittingOfficer || officerRating === 0}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {submittingOfficer ? <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Log Duty Audit'}
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center gap-4 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <Zap size={32} className="text-slate-200" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Awaiting resolutions to review.</p>
              </div>
            )}
          </div>

          <div className="card p-10 md:p-12 rounded-[3.5rem] border-none shadow-3xl bg-white shadow-slate-200/50 flex flex-col gap-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center border border-indigo-100 shadow-inner">
                <Users size={32} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Support Cadre</h3>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-full mt-2 w-max">Priority Alpha</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Facing critical downtime or authorization issues? Bypass the feedback terminal and sync with our technical rapid-response cadres.
            </p>
            <button className="w-full py-5 bg-slate-900 text-white hover:bg-indigo-600 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-2xl shadow-indigo-200/20 active:scale-95">
              Initialize Ops Console
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Feedback;
