import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE from '../config/api';
import { ShieldCheck, Send, Clock, CheckCircle2, AlertCircle, X, ArrowUpRight, ShieldAlert, Activity, Command, Zap, Download } from 'lucide-react';
import { exportFIR } from '../utils/exportFIR';

const ComplaintDetailsModal = ({ isOpen, onClose, complaint, role, user, onUpdate }) => {
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rating, setRating] = useState(complaint?.rating || 0);
  const [feedback, setFeedback] = useState(complaint?.feedback || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completionImage, setCompletionImage] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  useEffect(() => {
    if (complaint) {
      setNewStatus(complaint.status);
      setRemarks('');
      setRating(complaint.rating || 0);
      setFeedback(complaint.feedback || '');
      setError('');
    }
  }, [complaint]);

  const handleUpdateStatus = async () => {
    if (!remarks.trim()) {
      setError('Operational remarks are mandatory for status transitions.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      let finalResolutionUrl = null;
      if (completionImage && (newStatus === 'Resolved' || newStatus === 'Evidence Secured')) {
          setVerificationLoading(true);
          try {
            const base64 = await fileToBase64(completionImage);
            // Non-blocking verification attempt
            axios.post(`${API_BASE}/api/vision/verify-completion`, {
                imageBase64: base64,
                originalCategory: complaint.category,
                originalDescription: complaint.description
            }, config).catch(e => console.log("Background verification fail:", e));

            finalResolutionUrl = `https://simulated-storage.com/res-${completionImage.name}`;
          } catch (vErr) {
             console.log("Photo prep failed:", vErr);
          }
          setVerificationLoading(false);
      }

      await axios.put(`${API_BASE}/api/complaints/${complaint._id}`, {
        status: newStatus,
        remarks: remarks,
        resolutionEvidenceUrl: finalResolutionUrl
      }, config);
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.details || '';
      setError(err.response?.data?.message ? `${err.response.data.message} ${detail}` : 'Failed to sync status update with central command.');
      setVerificationLoading(false);
    } finally {
      setSubmitting(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRate = async () => {
    if (rating === 0) {
      setError('Please provide an integrity rating Score.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/api/complaints/${complaint._id}/rate`, {
        rating,
        feedback
      }, config);
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit performance evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!complaint) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-4xl rounded-[2rem] shadow-4xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden max-h-[92vh]"
          >
            {/* Left Column: Dossier Header & Content */}
            <div className="flex-1 p-8 md:p-10 overflow-y-auto no-scrollbar flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={13} className="text-primary-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Case Memo: {complaint.complaintId}</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Investigation Dossier</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                     <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${
                        complaint.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        complaint.status === 'In Progress' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                     }`}>
                        {complaint.status}
                     </span>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{complaint.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => exportFIR(complaint)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-[1rem] hover:bg-primary-600 transition-all shadow-lg shadow-slate-900/10 text-[10px] font-black uppercase tracking-widest active:scale-95 border border-transparent"
                    title="Export FIR to PDF"
                  >
                    <Download size={14} /> FIR PDF
                  </button>
                  <button 
                    onClick={onClose} 
                    className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-[1rem] hover:bg-slate-100 transition-all border border-slate-100 shadow-sm"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 shadow-inner group">
                <div className="flex items-center gap-2">
                   <Activity size={12} className="text-primary-500 opacity-50" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tactical Brief / AI Intake Summary</span>
                </div>
                <p className="text-base text-slate-800 font-bold leading-relaxed uppercase tracking-tight group-hover:text-slate-900 transition-colors">{complaint.firData?.fir_description || complaint.description}</p>
                {complaint.voiceTranscript && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Original Neural Transcript</span>
                     <p className="text-xs text-slate-600 font-bold leading-relaxed uppercase italic">{complaint.voiceTranscript}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 px-1">
                   <Clock size={14} className="text-primary-500" />
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Investigation Log</h3>
                </div>
                <div className="flex flex-col gap-6 relative pl-6">
                  <div className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-100"></div>
                  {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                    complaint.statusHistory.map((h, i) => (
                      <div key={i} className="relative group">
                        <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary-500 shadow-sm group-hover:scale-110 transition-transform z-10"></div>
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{h.status}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(h.updatedAt).toLocaleString()}</span>
                           </div>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">"{h.remarks || 'NO SYSTEM REMARKS LOGGED'}"</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-8 border-2 border-dashed border-slate-50 rounded-[1.5rem]">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Initializing Timeline Data...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Interaction Panel */}
            <div className="w-full md:w-[340px] bg-slate-50/50 p-8 md:p-10 overflow-y-auto no-scrollbar flex flex-col gap-8">
               {/* Controls Header */}
               <div className="flex flex-col gap-1 px-1">
                  <div className="flex items-center gap-2 text-primary-600">
                     <Command size={16} />
                     <h3 className="text-xs font-black uppercase tracking-[0.2em]">Command Console</h3>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Syncing with Central Intelligence</p>
               </div>

               {error && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-[9px] font-black text-rose-600 flex items-center gap-2.5">
                   <AlertCircle size={14} /> {error}
                 </motion.div>
               )}

               <AnimatePresence mode="wait">
                  {/* Officer Controls */}
                  {role === 'OFFICER' && !['Completed', 'Feedback Pending', 'Resolved', 'Closed'].includes(complaint.status) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                       <div className="flex flex-col gap-3">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">State Transition</label>
                          <div className="flex flex-col gap-1.5">
                             {['Submitted', 'Investigation Ongoing', 'Evidence Secured', 'Resolved'].map(status => (
                                <button 
                                  key={status}
                                  onClick={() => setNewStatus(status)}
                                  className={`w-full p-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-left transition-all border-2
                                    ${newStatus === status ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-white text-slate-400 hover:border-slate-200'}
                                  `}
                                >
                                   {status}
                                </button>
                             ))}
                          </div>
                       </div>
                       
                       <div className="flex flex-col gap-3">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Operational Log</label>
                          <textarea 
                            className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary-500/5 outline-none min-h-[100px] transition-all placeholder:text-slate-300"
                            placeholder="INITIALIZE REMARKS..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                       </div>

                       
                        {(newStatus === 'Resolved' || newStatus === 'Evidence Secured') && (
                           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex flex-col gap-3">
                              <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                 <Zap size={9} /> Resources (Optional)
                              </label>
                              <div className="relative group">
                                 <input 
                                   type="file" 
                                   accept="image/*"
                                   onChange={(e) => setCompletionImage(e.target.files[0])}
                                   className="w-full p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-[9px] font-black uppercase transition-all"
                                 />
                                 {completionImage && (
                                   <div className="mt-1.5 text-[8px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                                      <CheckCircle2 size={10} /> Resource Attached: {completionImage.name}
                                   </div>
                                 )}
                              </div>
                           </motion.div>
                        )}
        


                        <button 
                          onClick={handleUpdateStatus}
                          disabled={submitting || (newStatus === 'Completed' && verificationLoading)}
                          className="w-full bg-primary-600 text-white py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2.5"
                        >
                          {submitting ? (
                             <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span className="text-[8px]">{verificationLoading ? 'AI VERIFYING...' : 'SYNCING...'}</span>
                             </div>
                          ) : <>Commit Change <Send size={14} /></>}
                        </button>
        
                    </motion.div>
                  )}

                  {/* Citizen Review Area */}
                  {role === 'CITIZEN' && ['Completed', 'Feedback Pending', 'Resolved', 'Closed'].includes(complaint.status) && !complaint.rating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                       <div className="flex flex-col gap-4">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 text-center">Satisfaction Matrix</label>
                          <div className="grid grid-cols-5 gap-1.5">
                             {[1, 2, 3, 4, 5].map(s => (
                                <button 
                                  key={s}
                                  onClick={() => setRating(s)}
                                  className={`aspect-square rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center
                                    ${rating >= s ? 'bg-amber-400 border-amber-400 text-white shadow-lg shadow-amber-100' : 'bg-white border-white text-slate-300'}
                                  `}
                                >
                                   {s}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="flex flex-col gap-3">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Evaluation Echo</label>
                          <textarea 
                            className="w-full p-5 bg-white border border-slate-100 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary-500/5 outline-none min-h-[120px] transition-all placeholder:text-slate-300"
                            placeholder="FEEDBACK TRANSMISSION..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                          />
                       </div>

                       <button 
                         onClick={handleRate}
                         disabled={submitting}
                         className="w-full bg-slate-900 text-white py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/10 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2.5"
                       >
                         {submitting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <>Transmit Evaluation <Send size={14} /></>}
                       </button>
                    </motion.div>
                  )}

                  {/* Rating Display */}
                  {complaint.rating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
                       <div className="p-6 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 items-center text-center">
                          <div className="flex flex-col gap-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Evaluation Integrity</span>
                             <div className="flex items-center gap-1.5 justify-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${i < complaint.rating ? 'bg-amber-400' : 'bg-slate-100'}`}></div>
                                ))}
                             </div>
                          </div>
                          <div className="w-full h-px bg-slate-50"></div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic">"{complaint.feedback || 'ARCHIVED WITHOUT REMARKS'}"</p>
                       </div>
                       <div className="p-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 text-center flex flex-col gap-1.5">
                          <ShieldCheck size={24} className="text-emerald-500 mx-auto" />
                          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.3em]">Protocol Finalized</span>
                       </div>
                    </motion.div>
                  )}

                  {/* Default State / Info */}
                  {!((role === 'OFFICER' && !['Completed', 'Feedback Pending', 'Resolved', 'Closed'].includes(complaint.status)) || (['Completed', 'Feedback Pending', 'Resolved', 'Closed'].includes(complaint.status) && !complaint.rating)) && !complaint.rating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 py-8">
                       <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-slate-200 mx-auto opacity-50">
                          <Zap size={24} />
                       </div>
                       <div className="text-center flex flex-col gap-1">
                          <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em]">Operational Standby</span>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">Awaiting mission state transition or citizen evaluation triggers.</p>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComplaintDetailsModal;
