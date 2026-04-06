import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import { motion } from 'framer-motion';
import { 
  Archive,
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
  Zap,
  User,
  Activity,
  ShieldCheck,
  Star,
  Info,
  FileText
} from 'lucide-react';
import { exportReport } from '../utils/exportReport';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import AIAssistantPage from './AIAssistantPage';

const StaffDashboard = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const navigate = useNavigate();

  const fetchAssigned = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE}/api/complaints/assigned`, config);
      setComplaints(data);
      
      const profileRes = await axios.get(`${API_BASE}/api/auth/profile`, config);
      setProfile(profileRes.data);
    } catch (err) {
      console.error('Error fetching officer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssigned();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 font-mono tracking-widest uppercase">Loading Staff Portal...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Pending Action', count: complaints.filter(c => c.status === 'Submitted').length, icon: <Zap size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Under Review', count: complaints.filter(c => c.status === 'Under Review').length, icon: <Clock size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolved', count: complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  const getPriorityBadge = (priority) => {
    const p = priority?.toLowerCase();
    if (p === 'high' || p === 'critical') return <span className="status-badge status-error">High</span>;
    if (p === 'medium') return <span className="status-badge status-warning">Medium</span>;
    return <span className="status-badge status-info text-slate-500 border-slate-200">Low</span>;
  };

  const Overview = () => (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="header-box flex flex-col gap-3 relative group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/10 -mr-16 -mt-16 blur-[80px] rounded-full group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.7)]"></div>
          <span className="text-[9px] font-black text-primary-400 uppercase tracking-[0.3em]">Civic Staff Portal</span>
            </div>
            <div className="h-[1px] w-16 bg-white/10"></div>
            <span className="text-[9px] font-bold text-slate-500 font-mono tracking-widest uppercase flex items-center gap-2">
              OPERATIONAL
            </span>
          </div>
          <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                Grievance Overview
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                Synthesizing multi-sector grievance data for optimized municipal response.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-r from-white to-[#BBF7D0] p-8 flex items-center justify-between group rounded-[2.5rem] border border-green-200/60 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-[0.05] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stat.count}</span>
            </div>
            <div className={`${stat.bg} ${stat.color} p-5 rounded-[2rem] group-hover:rotate-12 transition-all duration-500 relative z-10 shadow-inner`}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Grievance Backlog</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Response Queue</span>
           </div>
           <button onClick={() => navigate('/staff/assigned')} className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest flex items-center gap-2 group">
             Full ledger <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

        <div className="card rounded-[3rem] border border-slate-900/10 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
          {loading ? (
             <div className="py-32 flex justify-center"><div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div></div>
          ) : complaints.length === 0 ? (
             <div className="py-24 text-center flex flex-col items-center gap-6">
                <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center text-slate-200"><ClipboardList size={40} /></div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-900 font-black text-sm uppercase tracking-widest">Queue Clear</span>
                  <span className="text-slate-400 font-medium text-xs">No active grievances in your department.</span>
                </div>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#DCFCE7] text-[#064E3B] border-b border-slate-900/10">
                    <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase border-r border-slate-900/10">Case ID</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase border-r border-slate-900/10">Priority</th>
                    <th className="px-8 py-6 text-[10px] font-black tracking-[0.2em] uppercase border-r border-slate-900/10">Category</th>
                    <th className="px-8 py-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-50/50">
                  {complaints.slice(0, 5).map((c, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={c._id} 
                      className="hover:bg-[#BBF7D0]/30 transition-all duration-300 group cursor-pointer"
                      onClick={() => setSelectedComplaint(c)}
                    >
                      <td className="px-8 py-6 border-r border-slate-900/10 border-b border-slate-900/10">
                         <span className="text-xs font-black text-slate-700 font-mono bg-slate-100 px-3 py-1.5 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors uppercase">{c.complaintId}</span>
                      </td>
                      <td className="px-8 py-6 border-r border-slate-900/10 border-b border-slate-900/10">
                        {getPriorityBadge(c.priority)}
                      </td>
                      <td className="px-8 py-6 border-r border-slate-900/10 border-b border-slate-900/10">
                         <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{c.category}</span>
                      </td>
                      <td className="px-8 py-6 text-right border-b border-slate-900/10">
                         <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                           <ChevronRight size={16} />
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="assigned" element={
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Grievance Records</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none uppercase">Case Ledger</h2>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Comprehensive record of all active and resolved grievances.</p>
        </div>
        <span className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Archive size={12} className="text-primary-500" /> {complaints.length} Records
        </span>
      </div>

             <div className="card rounded-[3.5rem] border border-slate-900/10 shadow-3xl shadow-slate-200/60 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#DCFCE7] text-[#064E3B] border-b border-slate-900/10">
                        <th className="px-10 py-7 text-[10px] font-black tracking-[0.3em] uppercase opacity-80 border-r border-slate-900/10">Case Ref</th>
                        <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase opacity-80 border-r border-slate-900/10">Classification</th>
                        <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase opacity-80 border-r border-slate-900/10">Priority</th>
                        <th className="px-10 py-7 text-[10px] font-black tracking-[0.2em] uppercase opacity-80 border-r border-slate-900/10">Grievance Status</th>
                        <th className="px-10 py-7 text-right text-[10px] font-black tracking-[0.3em] uppercase opacity-80">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-50/50">
                      {complaints.map((c, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          key={c._id} 
                          className="hover:bg-[#BBF7D0]/30 transition-all cursor-pointer group" 
                          onClick={() => setSelectedComplaint(c)}
                        >
                          <td className="px-10 py-7 border-r border-slate-900/10 border-b border-slate-900/10">
                            <span className="text-[13px] font-black font-mono text-slate-900 group-hover:text-primary-600 transition-colors uppercase">{c.complaintId}</span>
                          </td>
                          <td className="px-10 py-7 border-r border-slate-900/10 border-b border-slate-900/10">
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{c.category}</span>
                          </td>
                          <td className="px-10 py-7 border-r border-slate-900/10 border-b border-slate-900/10">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                c.priority === 'Critical' || c.priority === 'High' ? 'text-rose-500' :
                                c.priority === 'Medium' ? 'text-amber-500' : 'text-slate-400'
                            }`}>{c.priority}</span>
                          </td>
                          <td className="px-10 py-7 border-r border-slate-900/10 border-b border-slate-900/10">
                             <div className="flex items-center gap-2">
                               <span className={`w-2 h-2 rounded-full ${['Resolved', 'Closed'].includes(c.status) ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}></span>
                               <span className={`text-[10px] font-black uppercase tracking-widest ${['Resolved', 'Closed'].includes(c.status) ? 'text-emerald-600' : 'text-amber-600'}`}>
                                 {c.status}
                               </span>
                             </div>
                          </td>
                          <td className="px-10 py-7 text-right flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity border-b border-slate-900/10">
                             <button 
                               onClick={(e) => { e.stopPropagation(); exportReport(c); }}
                               className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                               title="Download PDF Summary"
                             >
                               <FileText size={16} />
                             </button>
                             <button className="px-6 py-2.5 bg-[#F8FBF8] text-[#0F1C12] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/20 transition-all active:scale-95">
                               View Details
                             </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        } />
        <Route path="workload" element={
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header flex-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col gap-3">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                    Performance Ledger
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                    Strategic evaluation of mission resolution velocity and Departmental Competency.
                  </p>
                </div>
              </div>

              {/* Service Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="xl:col-span-2 bg-gradient-to-r from-white to-[#BBF7D0] p-10 flex flex-col justify-between border border-green-200/60 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 rounded-[3.5rem] relative overflow-hidden text-[#0F1C12] min-h-[220px]"
                >
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px] -mr-32 -mt-32"></div>
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Total Operational Output</span>
                        <h3 className="text-lg font-black uppercase">Resolution Efficiency</h3>
                      </div>
                      <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
                        <TrendingUp size={24} className="text-primary-400" />
                      </div>
                   </div>
                   <div className="flex items-end justify-between relative z-10">
                      <div className="text-7xl font-black tracking-tighter leading-none">
                        {complaints.length > 0 ? ((complaints.filter(c => ['Completed', 'Feedback Pending', 'Resolved', 'Closed'].includes(c.status)).length / complaints.length) * 100).toFixed(0) : 0}%
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                           Positive Velocity <Activity size={12} />
                        </span>
                        <span className="text-xs font-bold text-slate-400">Global Avg: 84%</span>
                      </div>
                   </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-gradient-to-r from-white to-[#BBF7D0] p-10 flex flex-col justify-between border border-green-200/60 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 rounded-[3.5rem] relative overflow-hidden group"
                >
                   <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center group-hover:bg-amber-100 transition-colors duration-500">
                      <ShieldCheck size={28} />
                   </div>
                   <div className="flex flex-col pt-4">
                      <div className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                         {(complaints.reduce((acc, c) => acc + (c.rating || 0), 0) / (complaints.filter(c => c.rating).length || 1)).toFixed(1)}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 underline decoration-amber-400 decoration-2 underline-offset-4">Integrity Quotient</div>
                   </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-gradient-to-r from-white to-[#BBF7D0] p-10 flex flex-col justify-between border border-green-200/60 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 rounded-[3.5rem] relative overflow-hidden group"
                >
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-500">
                      <Zap size={28} />
                   </div>
                   <div className="flex flex-col pt-4">
                      <div className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                         {complaints.filter(c => ['Completed', 'Feedback Pending', 'Resolved', 'Closed'].includes(c.status)).length}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 underline decoration-emerald-400 decoration-2 underline-offset-4">Cases Resolved</div>
                   </div>
                </motion.div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Visual Analytics - Competency Radar */}
                <div className="card p-10 rounded-[3.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white flex flex-col gap-10">
                   <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                            <Activity size={24} />
                         </div>
                         <h3 className="text-xl font-black text-slate-900 uppercase">Departmental Competency</h3>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Procedural Weightage</span>
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {['Sanitation', 'Roads', 'Water Supply', 'Electricity'].map((cat, idx) => {
                        const count = complaints.filter(c => c.category === cat).length;
                        const resolvedCount = complaints.filter(c => c.category === cat && (['Completed', 'Feedback Pending', 'Resolved', 'Closed'].includes(c.status))).length;
                        const efficiency = count > 0 ? (resolvedCount / count) * 100 : 0;
                        
                        return (
                          <div key={idx} className="flex flex-col gap-3">
                             <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{cat}</span>
                                <span className="text-[10px] font-bold text-slate-400 font-mono">{efficiency.toFixed(0)}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${efficiency}%` }}
                                  transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                                  className={`h-full rounded-full bg-gradient-to-r ${idx % 2 === 0 ? 'from-primary-500 to-primary-600' : 'from-emerald-500 to-emerald-600'}`}
                                ></motion.div>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{count} Total Tasks</span>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                   <div className="mt-4 p-6 bg-slate-50 rounded-[2.5rem] flex items-center gap-6">
                      <Info size={24} className="text-primary-500 shrink-0" />
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Compentency is measured across all assigned sectors based on resolution-to-submission ratios. Higher percentages indicate faster, more effective civic service.
                      </p>
                   </div>
                </div>

                {/* Sentiment & Feedback Feed - High Fidelity Cards */}
                <div className="card p-10 rounded-[3.5rem] border-none shadow-2xl shadow-slate-200/50 bg-white flex flex-col gap-10">
                   <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <Activity size={24} />
                         </div>
                         <h3 className="text-xl font-black text-slate-900 uppercase">Citizen Feedback</h3>
                      </div>
                      <TrendingUp size={20} className="text-slate-300" />
                   </div>

                   <div className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {complaints.filter(c => c.rating).length > 0 ? (
                        complaints.filter(c => c.rating).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((c, i) => (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            key={c._id} 
                            className="p-8 bg-slate-50/70 rounded-[2.5rem] border border-transparent hover:border-amber-100 hover:bg-white hover:shadow-xl hover:shadow-amber-500/5 transition-all group"
                          >
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-black text-slate-900 font-mono tracking-tighter uppercase">{c.complaintId}</span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(c.updatedAt).toLocaleDateString()}</span>
                                   </div>
                                   <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em]">{c.category}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
                                   {[...Array(5)].map((_, star) => (
                                     <Star 
                                       key={star} 
                                       size={14} 
                                       className={`${star < (c.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} 
                                     />
                                   ))}
                                </div>
                             </div>
                             <div className="relative">
                                <div className="absolute -left-4 top-2 w-1 h-3 bg-primary-500 rounded-full"></div>
                                <p className="text-[14px] text-slate-600 font-medium italic leading-relaxed">
                                   "{c.feedback || 'Operational excellence acknowledged. Officer performance optimized and recorded.'}"
                                </p>
                             </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-20 flex flex-col items-center gap-6 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                           <Zap size={48} className="text-slate-100" />
                           <div className="flex flex-col gap-2">
                              <span className="text-sm font-black text-slate-400 uppercase tracking-widest italic font-mono">Archive Empty</span>
                              <p className="text-xs text-slate-400 font-medium max-w-sm">Awaiting initial service reviews from the citizen engagement portal.</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        } />
        <Route path="profile" element={
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl">
              <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header flex-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col gap-3">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                    Service Profile
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                    Authenticated municipal personnel and departmental credentials.
                  </p>
                </div>
              </div>

             <motion.div 
               initial={{ scale: 0.98, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="card p-12 md:p-16 flex flex-col gap-12 bg-white shadow-3xl shadow-slate-200/60 rounded-[4rem] border-none relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -ml-24 -mb-24 rounded-full"></div>

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                   <div className="w-40 h-40 rounded-[3.5rem] bg-[#F8FBF8] flex items-center justify-center text-[#0F1C12] text-5xl font-black shadow-2xl relative group">
                      <div className="absolute inset-0 bg-primary-600 rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10 uppercase">{profile?.name?.charAt(0)}</span>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                        <ShieldCheck size={24} className="text-white" />
                      </div>
                   </div>
                   <div className="flex flex-col gap-3 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] bg-primary-50 px-3 py-1 rounded-full border border-primary-100 uppercase">Active Duty</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1 rounded-full uppercase">Badge {profile?.officerId || '#PN-WAIT'}</span>
                      </div>
                      <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{profile?.name}</h2>
                      <p className="text-slate-500 font-bold font-mono tracking-widest text-sm italic">{profile?.email}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-slate-100 relative z-10">
                   <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Departmental Sector</span>
                      <div className="card bg-slate-50/80 p-6 rounded-[2.5rem] border-none group hover:bg-white hover:shadow-xl hover:shadow-primary-500/5 transition-all">
                         <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-slate-100">
                             <Activity size={22} />
                           </div>
                           <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{profile?.department || 'General Department'}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Main Branch</span>
                           </div>
                         </div>
                      </div>
                   </div>
                   <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Operational Rank</span>
                      <div className="card bg-slate-50/80 p-6 rounded-[2.5rem] border-none group hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                         <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                             <ShieldCheck size={22} />
                           </div>
                           <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{profile?.rank || profile?.role}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized</span>
                           </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex justify-center pt-8 relative z-10">
                   <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-rose-500 transition-colors">
                     Request Credential Modification
                   </button>
                </div>
             </motion.div>
          </div>
        } />
      </Routes>

      <ComplaintDetailsModal 
        isOpen={!!selectedComplaint} 
        onClose={() => setSelectedComplaint(null)} 
        complaint={selectedComplaint} 
        onUpdate={fetchAssigned}
        role="STAFF"
        user={user}
      />
    </>
  );
};

export default StaffDashboard;
