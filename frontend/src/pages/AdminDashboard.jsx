import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  Map as MapIcon,
  Filter,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Search,
  UserPlus,
  Eye,
  Building,
  Zap,
  ShieldCheck,
  Terminal,
  Lock,
  Mail,
  User as UserIcon,
  Trash2,
  FileText
} from 'lucide-react';
import { exportReport } from '../utils/exportReport';
import AssignmentModal from '../components/AssignmentModal';
import ComplaintDetailsModal from '../components/ComplaintDetailsModal';
import { Pie, Line, Bar } from 'react-chartjs-2';
import ComplaintMap from './ComplaintMap';
import OfficerDeptModal from '../components/OfficerDeptModal';
import AIAssistantPage from './AIAssistantPage';
import DepartmentModal from '../components/DepartmentModal';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Filler
} from 'chart.js';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Filler
);

const AdminDashboard = ({ user }) => {
  const [data, setData] = useState({ complaints: [], officers: [], analytics: null });
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState({ isOpen: false, complaint: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, complaint: null });
  const [deptFilter, setDeptFilter] = useState('');
  const [officerDeptModal, setOfficerDeptModal] = useState({ isOpen: false, officer: null });
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [cRes, oRes, aRes] = await Promise.all([
        axios.get(`${API_BASE}/api/complaints`, config),
        axios.get(`${API_BASE}/api/admin/staffs`, config),
        axios.get(`${API_BASE}/api/admin/analytics`, config)
      ]);
      setData({ complaints: cRes.data, officers: oRes.data, analytics: aRes.data });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Initiating DATA EXPORT protocol...');
    if (!data || !data.complaints || data.complaints.length === 0) {
      alert('NO INTELLIGENCE RECORDS FOUND TO EXPORT.');
      return;
    }
    
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      const adminId = user?.name || 'ADMIN-ALPHA-01';

      // Dossier Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); 
      doc.text('OFFICIAL GRIEVANCE SUMMARY', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); 
      doc.text(`ADMINISTRATOR: ${adminId.toUpperCase()}`, 14, 30);
      doc.text(`GENERATION TIMESTAMP: ${timestamp}`, 14, 35);
      doc.text(`TOTAL GRIEVANCES RECEIVED: ${data.complaints.length}`, 14, 40);

      // Data Compilation Process
      const tableData = data.complaints.map(c => [
        String(c.complaintId || 'N/A'),
        String(c.category || 'N/A'),
        String(c.priority || 'N/A'),
        String(c.status || 'N/A'),
        String(c.assignedOfficerUserId?.name || 'PENDING'),
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'
      ]);

      console.log('Synthesized rows for PDF, count:', tableData.length);

      // Call autoTable as a method on the doc instance
      if (doc.autoTable) {
        doc.autoTable({
          startY: 50,
          head: [['REF ID', 'CATEGORY', 'PRIORITY', 'STATUS', 'STAFF', 'DATE']],
          body: tableData,
          headStyles: { 
            fillColor: [15, 23, 42], 
            textColor: [255, 255, 255], 
            fontSize: 9, 
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: { 
            fontSize: 8, 
            textColor: [51, 65, 85],
            halign: 'left'
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { top: 50 },
          theme: 'grid'
        });
      } else {
        console.warn('doc.autoTable not found. Fallback to basic text dump.');
        doc.text('AutoTable plugin initialization failed - Falling back to raw data dump.', 14, 50);
        tableData.forEach((row, i) => {
          doc.text(`${row[0]} | ${row[1]} | ${row[3]}`, 14, 60 + (i * 10));
        });
      }

      console.log('Finalizing PDF serialization...');
      doc.save(`AUTHORITY_INTEL_DOSSIER_${Date.now()}.pdf`);
      console.log('Export Protocol: Successful Compilation.');
    } catch (err) {
      console.error('Export Protocol failure:', err);
      alert('CRITICAL ERROR DURING DATA EXPORT: ' + err.message);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Warning: Remove this department? All associated departmental data will be archived, and officers will be unallocated.')) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_BASE}/api/departments/${deptId}`, config);
      await fetchAdminData();
    } catch (err) {
      console.error('Department removal failed:', err);
      alert('Error decommission sector: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400 font-mono tracking-widest uppercase">Loading Admin Portal...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Volume', count: data.complaints.length, trend: '+12.5%', icon: <ShieldAlert size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Resolution', count: `${data.analytics?.avgResTime || 24}h`, trend: '-2h', icon: <Clock size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Citizen Satisfaction', count: `${data.analytics?.globalAvgRating || 0}/5.0`, trend: 'Optimal', icon: <TrendingUp size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Resolution Time', count: `${data.analytics?.avgResTime || 0}h`, trend: '-4.2%', icon: <Zap size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const categoricalSplit = data.analytics?.categoryCounts || {};
  const pieData = {
    labels: Object.keys(categoricalSplit),
    datasets: [{
      data: Object.values(categoricalSplit),
      backgroundColor: ['#16A34A', '#14B8A6', '#F59E0B', '#EF4444', '#64748B', '#16A34A', '#EC4899'],
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  const lineData = {
    labels: data.analytics?.activityLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Incoming Reports',
      data: data.analytics?.activityData || [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#16A34A',
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#16A34A',
      pointBorderWidth: 2
    }]
  };

  const officerBarData = {
    labels: data.analytics?.officerPerformance?.map(o => o.name) || [],
    datasets: [
      {
        label: 'Resolved',
        data: data.analytics?.officerPerformance?.map(o => o.resolved) || [],
        backgroundColor: '#10B981',
        borderRadius: 8,
      },
      {
        label: 'In Progress',
        data: data.analytics?.officerPerformance?.map(o => o.inProgress) || [],
        backgroundColor: '#F59E0B',
        borderRadius: 8,
      },
      {
        label: 'Assigned',
        data: data.analytics?.officerPerformance?.map(o => o.assigned) || [],
        backgroundColor: '#16A34A',
        borderRadius: 8,
      }
    ]
  };

  const SummaryView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
      <header className="header-box flex flex-col md:flex-row md:items-end justify-between gap-5 relative group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/10 -mr-16 -mt-16 blur-[80px] rounded-full group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.7)]"></div>
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-[0.3em]">Command Hierarchy: Portal Administrator</span>
          </div>
          <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header">
            <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                Admin Management Console
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                Aggregating grievance data for efficient public service management.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-3.5 bg-white text-slate-00 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-[#0F1C12] transition-all shadow-xl shadow-white/5 active:scale-95"
          >
            <Download size={13} className="text-primary-600 group-hover:text-white" /> Export Summary
          </button>
          <button className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-500/20 transition-all active:scale-95 border border-white/5">
            <Terminal size={13} /> System Protocols
          </button>
        </div>
      </header>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-gradient-to-r from-white to-[#BBF7D0] p-8 flex flex-col gap-6 group hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 relative overflow-hidden rounded-[2.5rem] border border-green-200/60"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-[0.05] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl transition-all duration-500 group-hover:bg-[#F8FBF8] group-hover:text-[#0F1C12] shadow-sm border border-current/10`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest ${
                stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                stat.trend.startsWith('-') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}>
                {stat.trend}
              </span>
            </div>
            
            <div className="flex flex-col relative z-10">
              <span className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{stat.count}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 flex flex-col gap-5"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Resolution Velocity</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Grievance Flow Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incoming Feed</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-10 h-[450px] hover-glow">
            <Line 
              data={lineData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  y: { 
                    grid: { color: '#f8fafc', drawTicks: false }, 
                    border: { display: false },
                    ticks: { font: { size: 10, weight: '700' }, color: '#94a3b8' }
                  }, 
                  x: { 
                    grid: { display: false },
                    ticks: { font: { size: 10, weight: '700' }, color: '#94a3b8' }
                  } 
                }
              }} 
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1 px-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Category Analysis</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Report Activity Density</p>
          </div>
          <div className="card-premium p-10 h-[450px] flex items-center justify-center relative overflow-hidden group hover-glow bg-white">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-white to-blue-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <Pie 
                data={pieData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { 
                      position: 'bottom',
                      labels: { 
                        usePointStyle: true, 
                        padding: 25,
                        font: { weight: '800', size: 10, family: 'Inter' },
                        color: '#64748b'
                      } 
                    } 
                  }
                }} 
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Officer Performance Matrix */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Staff Resolution Matrix</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Performance Across Departments</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
             <Activity size={12} className="text-slate-500 animate-pulse" />
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Operational Analysis</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-white to-[#BBF7D0] p-12 h-[570px] border border-green-200/60 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 rounded-[3.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 opacity-[0.02] -mr-48 -mt-48 rounded-full"></div>
           <Bar 
             data={officerBarData}
             options={{
               responsive: true,
               maintainAspectRatio: false,
               plugins: {
                 legend: { 
                    position: 'top', 
                    align: 'end',
                    labels: { 
                      font: { weight: '800', size: 9 }, 
                      usePointStyle: true, 
                      padding: 20,
                      color: '#475569'
                    } 
                 },
                 tooltip: {
                   backgroundColor: '#0F172A',
                   padding: 12,
                   titleFont: { size: 12, weight: 'bold' },
                   bodyFont: { size: 11 },
                   cornerRadius: 12,
                   callbacks: {
                     afterBody: (context) => {
                       const officerIdx = context[0].dataIndex;
                       const rating = data.analytics?.officerPerformance?.[officerIdx]?.avgRating || 0;
                       return `Service Rating: ${rating}/5.0`;
                     }
                   }
                 }
               },
               scales: {
                 x: { 
                    grid: { display: false }, 
                    stacked: false,
                    ticks: { font: { size: 10, weight: '800' }, color: '#64748b' }
                 },
                 y: { 
                    grid: { color: '#f8fafc', drawTicks: false }, 
                    border: { display: false },
                    beginAtZero: true,
                    suggestedMax: 5,
                    ticks: { font: { size: 10, weight: '700' }, color: '#94a3b8', stepSize: 1 }
                 }
               }
             }}
           />
        </div>
      </motion.div>

      {/* Map & Hotspots */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Regional Analysis</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Regional Volume Overview</p>
          </div>
          <Link to="/admin/map" className="group flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-2 rounded-full hover:bg-primary-600 hover:text-white transition-all">
            Open Map Explorer <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        <div className="card-premium p-0 overflow-hidden relative group h-[400px]">
           <div className="absolute inset-0 bg-[#F8FBF8] flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 opacity-30 grayscale contrast-125 pointer-events-none z-0">
                 <MapContainer style={{ width: '100%', height: '100%' }} center={[28.6139, 77.2090]} zoom={11} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                 </MapContainer>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/90 z-10 pointer-events-none"></div>
              <div className="relative z-20 flex flex-col items-center gap-6 text-center p-12 pointer-events-auto">
                <div className="w-20 h-20 bg-white/5 backdrop-blur-2xl rounded-[2.25rem] flex items-center justify-center border border-green-600/15 shadow-2xl group-hover:scale-110 group-hover:bg-white/10 transition-all duration-700">
                  <MapIcon size={40} className="text-green-500" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Regional Monitoring</h3>
                  <p className="text-slate-400 max-w-sm text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest">
                    Real-time visualization of grievance volume and staff member allocation across regional sectors.
                  </p>
                </div>
                <Link to="/admin/map" className="btn-primary py-4 px-10 shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95">View Regional Map</Link>
              </div>
           </div>
        </div>
      </motion.div>
      {/* Personnel Ledger & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Staff Performance</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Resolution Leaders</p>
            </div>
            <Link to="/admin/staffs" className="text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-colors">Full Personnel Roster</Link>
          </div>
          <div className="card-premium overflow-hidden bg-white border border-slate-900/10">
            <table className="w-full text-left uppercase">
              <thead className="bg-[#DCFCE7] text-[#064E3B] border-b border-slate-900/10">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">Personnel</th>
                  <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">Assignment Division</th>
                  <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50/50">
                {data.officers.slice(0, 4).map((o, idx) => (
                  <tr key={o._id} className="hover:bg-[#BBF7D0]/30 transition-all group">
                    <td className="px-8 py-5 border-r border-slate-900/10 border-b border-slate-900/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#F8FBF8] flex items-center justify-center text-[10px] font-black text-[#0F1C12] shadow-lg shadow-slate-200/60 group-hover:rotate-6 transition-all">
                          {o.name.charAt(0)}
                        </div>
                        <span className="text-xs font-black text-slate-800">{o.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-slate-500 flex flex-col border-r border-slate-900/10 border-b border-slate-900/10">
                       <span>{o.departmentId?.name || 'GENERAL SERVICES'}</span>
                       <span className="text-primary-500 text-[8px] font-black tracking-widest mt-0.5">{o.rank || 'Junior Staff'}</span>
                    </td>
                    <td className="px-8 py-5 text-right border-b border-slate-900/10">
                       <span className="status-badge status-success">HIGH FIDELITY</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">High Priority Cases</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Urgent Grievance Alerts</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">
              <ShieldAlert size={10} /> {data.complaints.filter(c => c.priority === 'High' || c.priority === 'Critical').length} ACTIVE
            </span>
          </div>
          <div className="flex flex-col gap-4">
             {data.complaints.filter(c => c.priority === 'High' || c.priority === 'Critical').slice(0, 3).map((c, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={c._id} 
                  className="bg-gradient-to-r from-white to-[#BBF7D0] p-6 flex items-center justify-between border border-green-200/60 hover:shadow-2xl transition-all group relative overflow-hidden underline-offset-8"
                >
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-rose-500 rounded-r-full group-hover:h-full transition-all duration-300"></div>
                   <div className="flex items-center gap-5 relative z-10">
                      <div className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 shadow-sm border border-rose-100">
                         <ShieldAlert size={20} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{c.complaintId}</span>
                         <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{c.category}</span>
                      </div>
                   </div>
                   <button onClick={() => navigate('/admin/complaints')} className="p-3 text-slate-300 hover:text-slate-900 bg-slate-50 rounded-xl transition-all hover:bg-white hover:shadow-lg">
                      <ChevronRight size={18} />
                   </button>
                </motion.div>
             ))}
             {data.complaints.filter(c => c.priority === 'High' || c.priority === 'Critical').length === 0 && (
                <div className="card p-16 flex flex-col items-center justify-center text-slate-400 gap-4 border-dashed border-2 border-slate-100 rounded-[3rem] bg-slate-50/30">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100">
                      <CheckCircle2 size={32} />
                   </div>
                   <div className="flex flex-col items-center text-center">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Status: Nominal</span>
                      <span className="text-[10px] font-medium text-slate-400 mt-1 italic uppercase tracking-widest">No High Priority Cases Detected</span>
                   </div>
                </div>
             )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">

      {loading ? (
        <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
      ) : (
        <Routes>
          <Route path="/" element={<SummaryView />} />
          <Route path="complaints" element={
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header flex-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
                  <div className="relative z-10 flex flex-col gap-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                      Grievance Ledger
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                      Monitoring {data.complaints.length} active grievance records across sectors.
                    </p>
                  </div>
                </div>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                    <input type="text" placeholder="Search records..." className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all w-80 shadow-sm" />
                  </div>
               </div>

                <div className="card-premium overflow-hidden bg-white/90 backdrop-blur-xl border border-slate-900/10 hover-glow">
                  <table className="w-full text-left uppercase">
                    <thead className="bg-[#F8FBF8] text-[#0F1C12] border-b border-slate-900/10">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">CASE ID</th>
                        <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">TYPE / CATEGORY</th>
                        <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">RESOLUTION STATUS</th>
                        <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] border-r border-slate-900/10">ASSIGNED STAFF</th>
                        <th className="px-8 py-5 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.complaints.map((c, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={c._id} 
                          className="hover:bg-slate-50/80 transition-all group cursor-default"
                        >
                          <td className="px-8 py-6 font-black text-slate-900 text-[11px] font-mono tracking-widest border-r border-slate-900/10 border-b border-slate-900/10">{c.complaintId}</td>
                          <td className="px-8 py-6 border-r border-slate-900/10 border-b border-slate-900/10">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-700">{c.category}</span>
                              <span className={`text-[9px] font-bold tracking-widest ${
                                c.priority === 'Critical' ? 'text-rose-500' : 
                                c.priority === 'High' ? 'text-amber-500' : 'text-slate-400'
                              }`}>{c.priority} PRIORITY</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 border-r border-slate-900/10 border-b border-slate-900/10">
                            <span className={`status-badge ${
                              c.status === 'Resolved' ? 'status-success' : 
                              c.status === 'In Progress' ? 'status-warning' : 
                              c.status === 'Assigned' ? 'status-info' : 'status-error'
                            } py-1 px-3 text-[10px] font-black border-none shadow-sm`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 font-black text-primary-600 text-[10px] tracking-wider border-r border-slate-900/10 border-b border-slate-900/10">
                            {c.assignedOfficerUserId?.name ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[8px] border border-primary-200 uppercase">
                                  {c.assignedOfficerUserId.name.charAt(0)}
                                </div>
                                 <div className="flex flex-col">
                                   <span className="leading-none">{c.assignedOfficerUserId.name}</span>
                                   <span className="text-[8px] font-black tracking-widest text-primary-400 mt-1">{c.assignedOfficerUserId.rank || 'Junior Staff'}</span>
                                 </div>
                              </div>
                            ) : (
                              <span className="text-rose-400 bg-rose-50 px-2 py-1 rounded-lg">AWAITING ASSIGNMENT</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity border-b border-slate-900/10">
                             <button 
                               onClick={() => setAssignModal({ isOpen: true, complaint: c })}
                               className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                               title="Assign Officer"
                             >
                                <UserPlus size={16} />
                             </button>
                             <button 
                               onClick={() => exportReport(c)}
                               className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                               title="Download PDF Dossier"
                             >
                                <FileText size={16} />
                             </button>
                             <button 
                               onClick={() => setDetailsModal({ isOpen: true, complaint: c })}
                               className="p-2.5 bg-[#F8FBF8] text-[#0F1C12] rounded-xl hover:bg-primary-600 transition-all shadow-xl"
                               title="View Record"
                             >
                                <Eye size={16} />
                             </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </motion.div>
          } />
          <Route path="map" element={<ComplaintMap user={user} />} />
          <Route path="departments" element={
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header flex-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
                  <div className="relative z-10 flex flex-col gap-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                      Service Departments
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                      Managing {(data.analytics?.departments?.length || 0)} specialized Public Service units.
                    </p>
                  </div>
                </div>
                  <button 
                    onClick={() => setIsDeptModalOpen(true)} 
                    className="group flex items-center gap-3 px-6 py-3.5 bg-[#F8FBF8] text-[#0F1C12] rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-500/20 transition-all active:scale-95"
                  >
                    <Building size={16} /> Add Department
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {data.analytics?.departments?.map((d, i) => (
                    <motion.div 
                      whileHover={{ y: -8 }}
                      key={i} 
                      className="card-premium p-10 flex flex-col gap-8 relative overflow-hidden group hover-glow bg-white"
                    >
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-[0.03] -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                       
                       <div className="flex items-center justify-between relative z-10">
                          <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-[1.25rem] flex items-center justify-center group-hover:bg-[#F8FBF8] group-hover:text-[#0F1C12] transition-all duration-500 border border-slate-100">
                             <Building size={24} />
                          </div>
                          <div className="flex flex-col items-end">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Staff Count</span>
                             <span className="text-2xl font-black text-slate-900 tracking-tighter">{d.officerCount}</span>
                          </div>
                       </div>
 
                       <div className="flex flex-col gap-3 relative z-10">
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{d.name}</h3>
                          <div className="flex flex-wrap gap-1.5">
                             {d.categories?.map((cat, ci) => (
                               <span key={ci} className="px-2.5 py-1 bg-blue-50/50 text-[9px] font-black text-blue-600 rounded-lg border border-blue-100/50 uppercase tracking-widest">{cat}</span>
                             ))}
                          </div>
                       </div>
 
                       <div className="pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
                          <div className="flex -space-x-2.5">
                             {[...Array(Math.min(3, d.officerCount))].map((_, idx) => (
                               <div key={idx} className="w-9 h-9 rounded-xl border-2 border-white bg-[#F8FBF8] flex items-center justify-center text-[10px] font-black text-[#0F1C12] shadow-lg">
                                 {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
                               </div>
                             ))}
                             {d.officerCount > 3 && (
                               <div className="w-9 h-9 rounded-xl border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                                 +{d.officerCount - 3}
                               </div>
                             )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeleteDepartment(d._id)}
                              className="w-10 h-10 rounded-xl bg-rose-50 text-rose-400 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100/50"
                              title="Remove Department"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#F8FBF8] hover:text-[#0F1C12] transition-all">
                              <ArrowUpRight size={18} />
                            </button>
                          </div>
                       </div>
                    </motion.div>
                  ))}
                  {(!data.analytics?.departments || data.analytics.departments.length === 0) && (
                    <div className="card p-20 lg:col-span-3 flex flex-col items-center justify-center text-slate-400 border-dashed border-2 border-slate-200 rounded-[3rem] bg-slate-50/50">
                       <Building size={48} className="mb-4 opacity-20" />
                       <span className="text-xs font-black uppercase tracking-[0.3em]">No Deployment Records</span>
                       <p className="text-[10px] font-medium text-slate-400 mt-2 italic">regional divisions are currently uninitialized.</p>
                    </div>
                  )}
               </div>
            </motion.div>
          } />
          <Route path="staffs" element={
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header flex-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
                  <div className="relative z-10 flex flex-col gap-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                      Staff Portal
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                      Managing {data.officers.length} active service personnel across sectors.
                    </p>
                  </div>
                </div>
                  <div className="flex items-center gap-3">
                    <select 
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                    >
                      <option value="">All Departments</option>
                      {data.analytics?.departments?.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                      <div className="status-pulse" style={{ '--pulse-color': '#10b981' }}></div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Force Active</span>
                    </div>
                  </div>
               </div>

                <div className="card-premium overflow-hidden bg-white border border-slate-900/10">
                   <table className="w-full text-left uppercase">
                     <thead className="bg-[#0f172a] text-white">
                       <tr>
                        <th className="px-10 py-6 text-[10px] font-black tracking-[0.2em] border-r border-white/10 text-white/90">Personnel ID</th>
                        <th className="px-10 py-6 text-[10px] font-black tracking-[0.2em] border-r border-white/10 text-white/90">Authority Branch</th>
                        <th className="px-10 py-6 text-[10px] font-black tracking-[0.2em] border-r border-white/10 text-white/90">Operational Status</th>
                        <th className="px-10 py-6 text-[10px] font-black tracking-[0.2em] border-r border-white/10 text-white/90">Efficiency KPI</th>
                        <th className="px-10 py-6 text-[10px] font-black tracking-[0.2em] text-center">Protocol Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {data.officers.filter(o => !deptFilter || o.departmentId?._id === deptFilter).map((o, idx) => {
                         const perf = data.analytics?.officerPerformance?.find(p => String(p._id) === String(o._id));
                         const totalTasks = perf ? ((perf.resolved || 0) + (perf.inProgress || 0) + (perf.assigned || 0)) : 0;
                         const trustScore = totalTasks === 0 ? 0 : Math.round(((perf.resolved || 0) / totalTasks) * 100);
                         const displayScore = totalTasks === 0 ? "OPTIMAL" : `${trustScore}%`;
                         const barWidth = totalTasks === 0 ? "0%" : `${trustScore}%`;
                         return (
                         <motion.tr 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.05 }}
                           key={o._id} 
                           className="hover:bg-blue-50/20 transition-all group"
                         >
                           <td className="px-10 py-7 border-r border-slate-900/10 border-b border-slate-900/10">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 rounded-2xl bg-[#F8FBF8] flex items-center justify-center text-xs font-black text-[#0F1C12] shadow-xl shadow-slate-900/10 group-hover:scale-110 group-hover:rotate-3 transition-all">
                                    {o.name.charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="text-xs font-black text-slate-900 tracking-tight uppercase">{o.rank || 'Junior Staff'} {o.name}</span>
                                   <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest leading-none mt-1 lowercase">{o.email}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7 border-r border-slate-900/10 border-b border-slate-900/10">
                              {o.departmentId?.name ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-black text-blue-600 tracking-widest decoration-2 decoration-blue-100 underline-offset-4">{o.departmentId.name}</span>
                                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Authorized Branch</span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-black text-rose-500 tracking-[0.2em] bg-rose-50 px-2 py-1 rounded">UNASSIGNED</span>
                                  <span className="text-[8px] font-black text-rose-300 uppercase italic tracking-tighter mt-1">Awaiting Allocation</span>
                                </div>
                              )}
                           </td>
                           <td className="px-10 py-7 border-r border-slate-900/10 border-b border-slate-900/10">
                              <span className={`status-badge ${o.status === 'Active' || !o.status ? 'status-success' : 'status-error'} py-1.5 px-3 text-[9px] font-black border-none shadow-sm`}>
                                 {o.status || 'Active'}
                               </span>
                            </td>
                            <td className="px-10 py-7 border-r border-slate-900/10 border-b border-slate-900/10">
                               <div className="flex flex-col gap-2 max-w-[140px]">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency KPI Score</span>
                                    <span className="text-[10px] font-black text-slate-900">{displayScore}</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#F8FBF8] rounded-full group-hover:bg-green-600 transition-all duration-500" style={{ width: barWidth }}></div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-7 text-center border-b border-slate-900/10">
                              <div className="flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => setOfficerDeptModal({ isOpen: true, officer: o })}
                                  className="px-6 py-2.5 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F8FBF8] hover:text-[#0F1C12] transition-all shadow-sm border border-slate-200/50"
                                >
                                  Reassign
                                </button>
                                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#F8FBF8] hover:text-[#0F1C12] transition-all border border-slate-100 shadow-sm">
                                  <Activity size={16} />
                                </button>
                              </div>
                           </td>
                         </motion.tr>
                       )})}
                     </tbody>
                   </table>
                </div>
            </motion.div>
          } />
          <Route path="profile" element={
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-5xl">
                <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header flex-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
                  <div className="relative z-10 flex flex-col gap-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                      Authority Profile
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                      Control Terminal Credentials for Administrative Level 5 Personnel.
                    </p>
                  </div>
                </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Personal ID Card */}
                  <div className="lg:col-span-2 flex flex-col gap-8">
                      <div className="bg-gradient-to-r from-white to-[#BBF7D0] p-12 relative overflow-hidden group hover:shadow-2xl transition-all rounded-[3.5rem] border border-green-200/60">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-primary-500/10 transition-colors duration-700"></div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            <div className="w-44 h-44 rounded-[3.5rem] bg-[#F8FBF8] flex items-center justify-center text-[#0F1C12] text-6xl font-black shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                               <div className="absolute inset-0 bg-green-600 rounded-[3.5rem] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                               <span className="relative z-10 uppercase">{user?.name?.charAt(0)}</span>
                               <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                                 <ShieldCheck size={28} className="text-white" />
                               </div>
                            </div>
                           
                           <div className="flex flex-col gap-4 text-center md:text-left flex-1">
                              <div className="flex items-center justify-center md:justify-start gap-3">
                                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-full border border-blue-100">Super Admin</span>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100">Authorized Access</span>
                              </div>
                              <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{user?.name}</h2>
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500">
                                    <Mail size={14} className="text-slate-300" />
                                    <span className="text-sm font-bold font-mono tracking-wider">{user?.email}</span>
                                 </div>
                                 <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                                    <Terminal size={14} className="text-slate-300" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Municipal Control Interface v4.0.2</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-12 mt-4 border-t border-slate-50 relative z-10">
                           <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Encryption Type</span>
                              <div className="bg-slate-50/80 p-5 rounded-3xl border border-transparent hover:border-emerald-100 transition-all">
                                 <div className="flex items-center gap-3">
                                    <Lock size={18} className="text-emerald-500" />
                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">AES-256 Quantum</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Access Level</span>
                              <div className="bg-slate-50/80 p-5 rounded-3xl border border-transparent hover:border-primary-100 transition-all">
                                 <div className="flex items-center gap-3">
                                    <Zap size={18} className="text-primary-500" />
                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Tier 1 Executive</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card-premium p-8 bg-white flex flex-col gap-4 hover-glow transition-all">
                           <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100">
                              <MoreHorizontal size={22} />
                           </div>
                           <div className="flex flex-col gap-1">
                              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Logs</h3>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed">Review your recent administrative actions and login history.</p>
                           </div>
                           <button className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest w-max hover:translate-x-1 transition-transform">Access Ledger &rarr;</button>
                        </div>
                        <div className="card-premium p-8 bg-white flex flex-col gap-4 hover-glow transition-all">
                           <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100">
                              <ShieldAlert size={22} />
                           </div>
                           <div className="flex flex-col gap-1">
                              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Security Audit</h3>
                              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-relaxed">Configure multi-factor authentication and terminal security.</p>
                           </div>
                           <button className="mt-2 text-[10px] font-black text-rose-600 uppercase tracking-widest w-max hover:translate-x-1 transition-transform">Configure Security &rarr;</button>
                        </div>
                     </div>
                  </div>

                   <div className="flex flex-col gap-6">
                      <div className="card-premium p-8 bg-slate-950 text-white flex flex-col gap-8 flex-1 border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Security Protocols</span>
                           <Activity size={16} className="text-emerald-400 animate-pulse" />
                        </div>

                         <div className="flex flex-col gap-8">
                            {[
                              { label: 'Zero Trust Network', status: 'Active', color: 'text-emerald-400', val: 100 },
                              { label: 'Global Audit Logging', status: 'Active', color: 'text-emerald-400', val: 100 },
                              { label: 'Panic Lockdown', status: 'Standby', color: 'text-rose-400', val: 0 }
                            ].map((item, i) => (
                              <div key={i} className="flex flex-col gap-4">
                                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">{item.label}</span>
                                    <span className={item.color}>{item.status}</span>
                                 </div>
                                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${item.color.replace('text', 'bg')} opacity-40`} style={{ width: item.val + '%' }}></div>
                                 </div>
                              </div>
                            ))}
                         </div>

                         <div className="mt-auto p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col gap-3">
                            <p className="text-[10px] text-slate-400 font-black leading-relaxed italic text-center uppercase tracking-widest opacity-60">
                              "Session Encrypted"
                            </p>
                         </div>
                     </div>
                  </div>
               </div>
            </div>
           } />
           <Route path="ai-assistant" element={<AIAssistantPage user={user} />} />
        </Routes>
      )}

      <AssignmentModal 
        isOpen={assignModal.isOpen} 
        onClose={() => setAssignModal({ isOpen: false, complaint: null })} 
        complaint={assignModal.complaint} 
        user={user} 
        onAssigned={fetchAdminData}
      />

      <ComplaintDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, complaint: null })}
        complaint={detailsModal.complaint}
        role="ADMIN"
        user={user}
        onUpdate={fetchAdminData}
      />

      <OfficerDeptModal
        isOpen={officerDeptModal.isOpen}
        onClose={() => setOfficerDeptModal({ isOpen: false, officer: null })}
        officer={officerDeptModal.officer}
        user={user}
        departments={data.analytics?.departments || []}
        onUpdate={fetchAdminData}
      />

      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        user={user}
        onUpdate={fetchAdminData}
      />
    </div>
  );
};

export default AdminDashboard;
