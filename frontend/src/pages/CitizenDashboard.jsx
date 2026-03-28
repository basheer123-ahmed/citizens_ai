import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ClipboardList,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  User as UserIcon,
  Search,
  MessageSquare,
  Map as MapIcon,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

const CitizenDashboard = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const navigate = useNavigate();

  const fetchRecentComplaints = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/complaints/my`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setComplaints(data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentComplaints();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Authenticating access...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Complaints', count: complaints.length, icon: <ClipboardList size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', count: complaints.filter(c => c.status === 'In Progress').length, icon: <Clock size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resolved', count: complaints.filter(c => c.status === 'Resolved').length, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Action Required', count: complaints.filter(c => c.status === 'Under Review').length, icon: <AlertCircle size={20} />, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return <span className="status-badge status-success border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">Resolved</span>;
      case 'In Progress': return <span className="status-badge status-warning border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">In Progress</span>;
      case 'Under Review': return <span className="status-badge status-info border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">Review</span>;
      default: return <span className="status-badge bg-slate-100 text-slate-500 border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">{status}</span>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
      <header className="header-box flex flex-col md:flex-row md:items-end justify-between gap-6 relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 -mr-20 -mt-20 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Civic Portal: Authorized Personnel</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none uppercase">{user?.name} Intelligence</h1>
          <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Synthesizing personal grievance reports for municipal oversight.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link to="/citizen/submit-complaint" className="flex items-center gap-2.5 px-8 py-4 bg-white text-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white hover:shadow-2xl hover:shadow-primary-500/40 transition-all active:scale-95 shadow-xl shadow-white/5">
            <PlusCircle size={14} /> Initialize Report
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="card p-8 flex flex-col gap-6 group hover:shadow-3xl hover:shadow-slate-200/50 transition-all duration-500 rounded-[2.5rem] border-none bg-white relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg.replace('bg-', 'bg-').split('-')[0]}-500/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl transition-all duration-500 group-hover:bg-slate-900 group-hover:text-white shadow-sm`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest bg-slate-50 text-slate-500 border border-slate-100`}>
                ACTIVE FEED
              </span>
            </div>
            
            <div className="flex flex-col relative z-10">
              <span className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{stat.count}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Recent Complaints Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Activity</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Tracking {complaints.length} localized protocols</p>
            </div>
            <Link to="/citizen/my-complaints" className="group flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-2 rounded-full hover:bg-primary-600 hover:text-white transition-all">
              Launch Archive Intelligence <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="card overflow-hidden border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-md rounded-[2.5rem]">
            {loading ? (
              <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
            ) : complaints.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 opacity-50">
                    <Activity size={32} className="text-slate-300" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">No Active Feeds</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Localized infrastructure reported as nominal.</span>
                 </div>
              </div>
            ) : (
              <table className="w-full text-left uppercase">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em]">Deployment ID</th>
                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em]">Service Category</th>
                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em]">Protocol Status</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {complaints.map((c, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={c._id} 
                      onClick={() => setSelectedComplaint(c)}
                      className="group cursor-default hover:bg-slate-50/80 transition-all"
                    >
                      <td className="px-8 py-6">
                        <span className="text-[11px] font-black text-slate-900 font-mono tracking-widest">{c.complaintId}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 tracking-tight">{c.category}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sector Alert</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">{getStatusBadge(c.status)}</td>
                      <td className="px-8 py-6 text-right">
                         <button className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-primary-600 transition-all opacity-0 group-hover:opacity-100 shadow-xl">
                            <ArrowUpRight size={16} />
                         </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Action Side Card */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 px-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Protocols</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Instant Incident Reporting</p>
          </div>
          
          <motion.div 
            whileHover={{ y: -8 }}
            className="card p-10 bg-slate-900 border-none shadow-3xl shadow-slate-200/50 rounded-[3rem] text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex flex-col gap-8">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl group-hover:bg-primary-600 transition-colors duration-500">
                <Zap size={32} className="text-primary-400 group-hover:text-white" />
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">New Intelligence Feed</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed opacity-80 uppercase tracking-wider">
                  Initialize a new localized grievance report to municipal authorities.
                </p>
              </div>
              
              <Link 
                to="/citizen/submit-complaint" 
                className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs text-center hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-primary-500/20 active:scale-[0.98]"
              >
                Launch Protocol
              </Link>
            </div>
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2 opacity-30">
               <ShieldCheck size={12} className="text-emerald-400" />
               <span className="text-[8px] font-black uppercase tracking-[0.3em]">Authorized Session</span>
            </div>
          </motion.div>

          <div className="card p-8 bg-white border-none shadow-2xl shadow-slate-200/40 rounded-[2.5rem] flex flex-col gap-5">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                   <MessageSquare size={20} />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Link</span>
                   <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Feedback Loop</span>
                </div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Ensure your localized protocols are resolved at high-fidelity levels.</p>
             <Link to="/citizen/feedback" className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1.5 hover:translate-x-1 transition-transform">
                Initiate Feedback Protocol <ChevronRight size={12} />
             </Link>
          </div>
        </div>
      </div>

      <ComplaintDetailsModal 
        isOpen={!!selectedComplaint} 
        onClose={() => setSelectedComplaint(null)} 
        complaint={selectedComplaint} 
        user={user}
        role="CITIZEN"
        onUpdate={fetchRecentComplaints}
      />
    </motion.div>
  );
};

export default CitizenDashboard;
