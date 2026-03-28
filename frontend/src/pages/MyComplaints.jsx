import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { 
  Search, 
  Filter as FilterIcon, 
  Calendar, 
  Tag, 
  Info,
  ChevronRight,
  MoreVertical,
  ArrowUpDown,
  Archive,
  ArrowUpRight,
  Zap,
  Activity,
  ShieldCheck,
  Search as SearchIcon,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';

const MyComplaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/api/complaints/my`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved': return <span className="status-badge status-success border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">Resolved</span>;
      case 'In Progress': return <span className="status-badge status-warning border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">In Progress</span>;
      case 'Under Review': return <span className="status-badge status-info border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">Review</span>;
      default: return <span className="status-badge bg-slate-100 text-slate-500 border-none shadow-sm px-3 py-1 text-[10px] font-black uppercase">{status}</span>;
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesFilter = filter === 'All' || c.status === filter;
    const matchesSearch = c.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.complaintId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
      <header className="header-box flex flex-col md:flex-row md:items-end justify-between gap-6 relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 -mr-20 -mt-20 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Civic Archive: Personal History</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">Protocol Archive</h1>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Synthesizing reporting protocols for personalized oversight.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <span className="flex items-center gap-1.5 px-6 py-3 bg-white/5 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl backdrop-blur-md">
            <Archive size={12} className="text-primary-400" /> Total Records: {complaints.length}
          </span>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 group w-full">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="SEARCH BY PROTOCOL ID OR CATEGORY..."
            className="w-full pl-13 pr-5 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-[1.5rem] w-full lg:w-max">
           {['All', 'Under Review', 'In Progress', 'Resolved'].map((tab) => (
             <button
               key={tab}
               onClick={() => setFilter(tab)}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95
                 ${filter === tab ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-slate-900'}
               `}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="card overflow-hidden border-none shadow-3xl shadow-slate-200/50 bg-white/80 backdrop-blur-md rounded-[2.5rem]">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
          ) : filteredComplaints.length === 0 ? (
             <div className="p-20 text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 opacity-50">
                    <Activity size={40} className="text-slate-300" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Status: Zero Records</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">No active protocols detected within specified filters.</span>
                </div>
             </div>
          ) : (
            <table className="w-full text-left uppercase">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em]">Protocol ID</th>
                  <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em]">Categorization</th>
                  <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em]">Operational State</th>
                  <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em]">Deployment Date</th>
                  <th className="px-8 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredComplaints.map((c, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    key={c._id} 
                    className="hover:bg-slate-50/80 transition-all group"
                  >
                    <td className="px-8 py-6">
                       <span className="text-[11px] font-black text-slate-900 font-mono tracking-widest">{c.complaintId}</span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                           <Layers size={14} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 tracking-tight">{c.category}</span>
                            <span className="text-[9px] font-bold text-slate-400 tracking-widest">Sector Protocol</span>
                         </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black tracking-widest">
                          <Calendar size={12} className="text-primary-500" />
                          {new Date(c.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                         onClick={() => setSelectedComplaint(c)}
                         className="p-3 bg-slate-900 text-white rounded-xl hover:bg-primary-600 transition-all opacity-0 group-hover:opacity-100 shadow-2xl shadow-primary-500/20 active:scale-90"
                       >
                         <ArrowUpRight size={18} />
                       </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ComplaintDetailsModal 
        isOpen={!!selectedComplaint} 
        onClose={() => setSelectedComplaint(null)} 
        complaint={selectedComplaint} 
        role="CITIZEN"
        user={user}
        onUpdate={fetchComplaints}
      />
    </motion.div>
  );
};

export default MyComplaints;
