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
import { useCitizenLang } from '../context/CitizenLanguageContext';

const UserDashboard = ({ user }) => {
  const { t } = useCitizenLang();
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
        <p className="text-sm font-medium text-slate-400">{t('dash_auth')}</p>
      </div>
    );
  }

  const stats = [
    { label: t('stat_totalComplaints'), count: complaints.length, icon: <ClipboardList size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('stat_inProgress'), count: complaints.filter(c => c.status === 'In Progress').length, icon: <Clock size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('stat_resolved'), count: complaints.filter(c => c.status === 'Resolved').length, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('stat_actionRequired'), count: complaints.filter(c => c.status === 'Under Review').length, icon: <AlertCircle size={20} />, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  const getStatusLabel = (status) => {
    const map = {
      'RESOLVED': t('status_resolved'),
      'IN PROGRESS': t('status_inProgress'),
      'PENDING': t('status_pending'),
      'UNDER REVIEW': t('status_actionRequired'),
      'ACTION REQUIRED': t('status_actionRequired'),
    };
    return map[status?.toUpperCase()] || status;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return <span className="status-badge status-success border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">{getStatusLabel(status)}</span>;
      case 'In Progress': return <span className="status-badge status-warning border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">{getStatusLabel(status)}</span>;
      case 'Under Review': return <span className="status-badge status-info border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">{getStatusLabel(status)}</span>;
      default: return <span className="status-badge bg-slate-100 text-slate-500 border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">{getStatusLabel(status)}</span>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
      <header className="header-box flex flex-col md:flex-row md:items-end justify-between gap-6 relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 -mr-20 -mt-20 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">{t('dashboard_title')}</span>
          </div>
          <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                {user?.name} {t('profile_title')}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed">
                {t('profile_subtitle')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link to="/user/submit-complaint" className="flex items-center gap-2.5 px-8 py-4 bg-white text-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-[#0F1C12] hover:shadow-2xl hover:shadow-primary-500/40 transition-all active:scale-95 shadow-xl shadow-white/5">
            <PlusCircle size={14} /> {t('btn_newComplaint')}
          </Link>
        </div>
      </header>

      <div className="w-full h-px bg-slate-300"></div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-gradient-to-r from-white to-[#BBF7D0] p-8 flex flex-col gap-6 group hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 rounded-[2.5rem] border border-green-200/60 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg.replace('bg-', 'bg-').split('-')[0]}-500/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl transition-all duration-500 group-hover:bg-[#F8FBF8] group-hover:text-[#0F1C12] shadow-sm`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest bg-slate-50 text-slate-500 border border-slate-100`}>
                {t('stat_activeFeed')}
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
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('activity_title')}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                {t('activity_subtitle_prefix')} {complaints.length} {t('activity_subtitle_suffix')}
              </p>
            </div>
            <Link to="/user/my-complaints" className="group flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-2 rounded-full hover:bg-primary-600 hover:text-white transition-all">
              {t('btn_viewHistory')} <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="bg-gradient-to-r from-white to-[#BBF7D0] overflow-hidden border border-slate-900/10 shadow-2xl shadow-green-900/10 hover:shadow-green-900/20 transition-all duration-500 rounded-[2.5rem] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-[0.02] -mr-32 -mt-32 rounded-full"></div>
            {loading ? (
              <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
            ) : complaints.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 opacity-50">
                    <Activity size={32} className="text-slate-300" />
                 </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('dash_no_feeds')}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dash_no_feeds_desc')}</span>
                  </div>
              </div>
            ) : (
              <table className="w-full text-left uppercase">
                <thead className="bg-[#DCFCE7] text-[#064E3B] border-b border-slate-900/10">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">{t('table_complaintId')}</th>
                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">{t('table_category')}</th>
                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">{t('table_status')}</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-50/50">
                  {complaints.map((c, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={c._id} 
                      onClick={() => setSelectedComplaint(c)}
                      className="group cursor-default hover:bg-[#BBF7D0]/30 transition-all uppercase"
                    >
                      <td className="px-8 py-6 border-r border-slate-900/10 border-b border-slate-900/10">
                        <span className="text-[11px] font-black text-slate-900 font-mono tracking-widest">{c.complaintId}</span>
                      </td>
                      <td className="px-8 py-6 border-r border-slate-900/10 border-b border-slate-900/10">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 tracking-tight">{c.category}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('dash_issue_type')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 border-r border-slate-900/10 border-b border-slate-900/10">{getStatusBadge(c.status)}</td>
                      <td className="px-8 py-6 text-right border-b border-slate-900/10">
                         <button className="p-2.5 bg-[#F8FBF8] text-[#0F1C12] rounded-xl hover:bg-primary-600 transition-all opacity-0 group-hover:opacity-100 shadow-xl">
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
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('newGrievances_title')}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{t('newGrievances_subtitle')}</p>
          </div>
          
          <motion.div 
            whileHover={{ y: -8 }}
            className="card p-10 bg-[#F8FBF8] border-none shadow-3xl shadow-slate-200/50 rounded-[3rem] text-[#0F1C12] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex flex-col gap-8">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-green-600/15 shadow-2xl group-hover:bg-primary-600 transition-colors duration-500">
                <Zap size={32} className="text-primary-400 group-hover:text-white" />
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">{t('btn_newComplaintSection')}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed opacity-80 uppercase tracking-wider">
                  {t('dash_file_desc')}
                </p>
              </div>
              
              <Link 
                to="/user/submit-complaint" 
                className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs text-center hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-primary-500/20 active:scale-[0.98]"
              >
                {t('dash_file_now')}
              </Link>
            </div>
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2 opacity-30">
               <ShieldCheck size={12} className="text-emerald-400" />
               <span className="text-[8px] font-black uppercase tracking-[0.3em]">{t('dash_secure_session')}</span>
            </div>
          </motion.div>

          <div className="card p-8 bg-white border-none shadow-2xl shadow-slate-200/40 rounded-[2.5rem] flex flex-col gap-5">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                   <MessageSquare size={20} />
                </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Status</span>
                   <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{t('dash_user_feedback')}</span>
                </div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">{t('dash_feedback_desc')}</p>
             <Link to="/user/feedback" className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1.5 hover:translate-x-1 transition-transform">
                {t('dash_submit_feedback')} <ChevronRight size={12} />
             </Link>
          </div>
        </div>
      </div>

      <ComplaintDetailsModal 
        isOpen={!!selectedComplaint} 
        onClose={() => setSelectedComplaint(null)} 
        complaint={selectedComplaint} 
        user={user}
        role="USER"
        onUpdate={fetchRecentComplaints}
      />
    </motion.div>
  );
};

export default UserDashboard;
