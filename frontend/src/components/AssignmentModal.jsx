import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Building, ShieldCheck, AlertCircle, Zap } from 'lucide-react';

const AssignmentModal = ({ isOpen, onClose, complaint, user, onAssigned }) => {
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (complaint && departments.length > 0 && officers.length > 0) {
      let targetDivisionName = '';
      const cat = complaint.category || '';
      
      if (['Theft', 'Missing Person'].includes(cat)) targetDivisionName = 'Crime';
      else if (cat === 'Cyber Crime') targetDivisionName = 'Cyber';
      else if (cat.includes('Harassment') || cat === 'Domestic Violence') targetDivisionName = 'Women';
      else if (cat === 'Accident') targetDivisionName = 'Traffic';
      else if (cat === 'Suspicious Activity') targetDivisionName = 'Intelligence';
      else targetDivisionName = 'Patrol';

      let targetDept = departments.find(d => d.name.toLowerCase().includes(targetDivisionName.toLowerCase()));
      if (!targetDept) targetDept = departments[0]; // Fallback to primary sector if exact match fails
      
      if (targetDept) {
         let deptOfficers = officers.filter(o => (o.departmentId?._id || o.departmentId) === targetDept._id);
         
         // Immediate fallback: If no officers in that specialized department, evaluate entire force
         if (deptOfficers.length === 0) {
            deptOfficers = [...officers];
         }
         
         // Filter by Availability
         const available = deptOfficers.filter(o => o.availability_status === 'Available' || !o.availability_status);
         if (available.length > 0) deptOfficers = available;

         // Sort by Workload
         deptOfficers.sort((a, b) => (a.active_cases_count || 0) - (b.active_cases_count || 0));

         // Match priority with rank
         const priority = complaint.priority || 'Medium';
         let preferredRanks = [];
         if (priority === 'High' || priority === 'Critical') preferredRanks = ['Inspector', 'Sub-Inspector (SI)', 'DSP', 'SP'];
         else if (priority === 'Medium') preferredRanks = ['Sub-Inspector (SI)', 'Assistant Sub-Inspector (ASI)', 'Inspector'];
         else preferredRanks = ['Head Constable', 'Constable', 'Assistant Sub-Inspector (ASI)'];

         let bestCandidate = deptOfficers.find(o => preferredRanks.includes(o.rank));
         let reasonBullets = [];

         if (bestCandidate) {
            const actualDept = departments.find(d => d._id === (bestCandidate.departmentId?._id || bestCandidate.departmentId)) || targetDept;
            reasonBullets.push(`Matches ${actualDept.name} classification protocol`);
            reasonBullets.push(`Optimal personnel rank capability for ${priority.toUpperCase()} priority alert`);
            reasonBullets.push(`Optimized workload capacity (${bestCandidate.active_cases_count || 0} active parameters)`);
         } else if (deptOfficers.length > 0) {
            bestCandidate = deptOfficers[0];
            const actualDept = departments.find(d => d._id === (bestCandidate.departmentId?._id || bestCandidate.departmentId)) || targetDept;
            reasonBullets.push(`Matches ${actualDept.name} classification protocol`);
            reasonBullets.push(`Lowest available workload algorithm (${bestCandidate.active_cases_count || 0} active parameters)`);
         }

         if (bestCandidate) {
            const finalDept = departments.find(d => d._id === (bestCandidate.departmentId?._id || bestCandidate.departmentId)) || targetDept;
            reasonBullets.push(`Currently marked as AVAILABLE for immediate dispatch`);
            setSuggestion({
               department: finalDept,
               officer: bestCandidate,
               reasonBullets
            });
         }
      }
    }
  }, [complaint, departments, officers]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (complaint?.assignedDepartmentId) setSelectedDept(complaint.assignedDepartmentId);
      if (complaint?.assignedOfficerUserId) setSelectedOfficer(complaint.assignedOfficerUserId?._id || complaint.assignedOfficerUserId);
    }
  }, [isOpen, complaint]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [deptRes, officerRes] = await Promise.all([
        axios.get(`${API_BASE}/api/departments`, config),
        axios.get(`${API_BASE}/api/admin/officers`, config)
      ]);
      setDepartments(deptRes.data);
      setOfficers(officerRes.data);
    } catch (err) {
      setError('System failure while retrieving personnel records.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedDept || !selectedOfficer) {
      setError('Command incomplete: Both department and personnel required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/api/admin/assign/${complaint._id}`, {
        departmentId: selectedDept,
        officerId: selectedOfficer
      }, config);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization error: Failed to commit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSuggest = async (suggest) => {
    setSubmitting(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/api/admin/assign/${complaint._id}`, {
        departmentId: suggest.department._id,
        officerId: suggest.officer._id
      }, config);
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization error: Failed to commit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return null;

  const filteredOfficers = officers.filter(o => {
    const deptId = o.departmentId?._id || o.departmentId;
    return !selectedDept || deptId === selectedDept;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-4xl flex flex-col max-h-[88vh] border border-slate-100 overflow-hidden"
          >
            <div className="flex justify-between items-start p-6 md:p-8 pb-3 shrink-0 bg-white border-b border-slate-50 z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded w-max">Mission Assignment</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Personnel Allocation</h2>
              </div>
              <button onClick={onClose} className="p-1.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 md:p-8 pt-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar">

              {error && (
                <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl flex items-center gap-2.5 text-rose-600 text-[11px] font-bold animate-in fade-in zoom-in duration-300">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {complaint.description && (
                 <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-inner">
                    <div className="flex items-center gap-2">
                       <Zap size={14} className="text-primary-600" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Intake Summary</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 leading-relaxed uppercase">{complaint.firData?.fir_description || complaint.description}</p>
                 </div>
              )}

              {suggestion && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary-50/50 border border-primary-100 p-5 rounded-[1.5rem] flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                     <Zap size={14} className="text-primary-600" />
                     <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">AI Assignment Suggestion</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-primary-100/30">
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Division</span>
                        <span className="text-[11px] font-black text-slate-900">{suggestion.department.name}</span>
                     </div>
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Strategic Asset</span>
                        <span className="text-[11px] font-black text-slate-900">{suggestion.officer.name}</span>
                     </div>
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Rank Match</span>
                        <span className="text-[11px] font-black text-slate-900">{suggestion.officer.rank || 'CONSTABLE'}</span>
                     </div>
                     <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Cases</span>
                        <span className="text-[11px] font-black text-slate-900">{suggestion.officer.active_cases_count || 0}</span>
                     </div>
                  </div>
                  <div className="bg-white/60 p-3.5 rounded-lg border border-primary-100 text-[10px] font-medium text-slate-700 leading-snug flex flex-col gap-1.5">
                     <span className="font-bold text-slate-900">Selection Rationale:</span>
                     <ul className="list-disc pl-3.5 flex flex-col gap-0.5 opacity-80">
                        {suggestion.reasonBullets.map((bullet, idx) => (
                           <li key={idx} className="tracking-tight">{bullet}</li>
                        ))}
                     </ul>
                  </div>
                  <button 
                    onClick={() => handleAssignSuggest(suggestion)} 
                    disabled={submitting}
                    className="w-full bg-slate-900 hover:bg-primary-600 text-white py-2.5 mt-0.5 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Zap size={12} /> Auto Deployment
                  </button>
                </motion.div>
              )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Operation Sector</label>
                  <div className="relative group">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors pointer-events-none" size={16} />
                    <select
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-[11px] text-slate-700 cursor-pointer"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    >
                      <option value="">Select Precinct Division</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Designated Personnel</label>
                  <div className="relative group">
                    <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-500 transition-colors pointer-events-none" size={16} />
                    <select
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-[11px] text-slate-700 cursor-pointer"
                      value={selectedOfficer}
                      onChange={(e) => setSelectedOfficer(e.target.value)}
                    >
                      <option value="">Select Tactical Personnel</option>
                      {selectedDept && (
                        <optgroup label="Sector Specialists">
                          {officers.filter(o => (o.departmentId?._id || o.departmentId) === selectedDept).map(off => (
                            <option key={off._id} value={off._id}>{off.rank || 'CONSTABLE'} {off.name}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label={selectedDept ? "Cross-Sector Personnel" : "All Personnel"}>
                        {officers.filter(o => !selectedDept || (o.departmentId?._id || o.departmentId) !== selectedDept).map(off => (
                          <option key={off._id} value={off._id}>{off.name} [{off.departmentId?.name || 'Unallocated'}]</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

              <div className="flex flex-col gap-3.5 pt-1">
                <button
                  onClick={handleAssign}
                  disabled={submitting}
                  className="bg-primary-600 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 w-full"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Commit Deployment</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-80">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Validated</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Traceable ID</div>
                </div>
                </div>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentModal;
