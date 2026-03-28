import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, FileText, CheckCircle2, Clock, MapPin, Copy, Search, ShieldAlert, ArrowRight, ClipboardList, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../config/api';

const AIAssistantPage = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [attached, setAttached] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${API_BASE}/api/complaints`, config);
        // Only show unassigned / pending complaints
        const pending = data.filter(c => c.status === 'Submitted' || c.status === 'Assigned' || c.status === 'Investigation Ongoing');
        setComplaints(pending);
      } catch (err) {
        console.error("Failed to load complaints for AI");
      }
    };
    fetchComplaints();
  }, [user]);

  const handleSelectComplaint = (c) => {
    setSelectedComplaint(c);
    setResult(null); // clear prev result
    setError('');
    setAttached(false);
  };

  const handleGenerate = async () => {
    if (!selectedComplaint) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);
    setAttached(false);

    try {
      const textToAnalyze = selectedComplaint.translatedText || selectedComplaint.originalDescription || selectedComplaint.description;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_BASE}/api/complaints/analyze-complaint`, { text: textToAnalyze }, config);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI Engine failed to process the request.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachFIR = async () => {
    if (!result || !selectedComplaint) return;
    setAttaching(true);
    setError('');
    try {
       const config = { headers: { Authorization: `Bearer ${user.token}` } };
       await axios.put(`${API_BASE}/api/admin/fir/${selectedComplaint._id}`, { firData: result }, config);
       setAttached(true);
       
       // Update local selected state visually
       setSelectedComplaint({...selectedComplaint, firData: result});

       // Also update the complaints array so the checkmark stays
       setComplaints(prev => prev.map(c => 
          c._id === selectedComplaint._id ? { ...c, firData: result } : c
       ));

    } catch (err) {
       setError(err.response?.data?.message || 'Failed to attach FIR to the database.');
    } finally {
       setAttaching(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const firText = `FIR DRAFT\n\nCase Type: ${result.case_type}\nPriority: ${result.priority}\nTime: ${result.time}\nLocation: ${result.location}\n\nSummary:\n${result.summary}\n\nFIR Description:\n${result.fir_description || "Complaint indicates a reported incident requiring investigation."}`;
    navigator.clipboard.writeText(firText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-[1400px] mx-auto w-full pb-16">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
               <div className="bg-primary-600/10 p-2 rounded-xl border border-primary-500/20">
                 <Bot size={20} className="text-primary-600" />
               </div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">AI FIR Generator</h1>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-80">Generate structured procedural FIR drafts natively from unassigned complaint dossiers.</p>
         </div>
         <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-lg">
            <Sparkles size={12} className="text-primary-500 animate-pulse" />
            <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Neural Net Online / Read-Only Sync</span>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Complaint List */}
        <div className="xl:col-span-4 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Dispatch Log</span>
              <span className="bg-slate-200 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full">{complaints.length} Records</span>
           </div>
           
           <div className="flex flex-col gap-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {complaints.length === 0 ? (
                 <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                    <ClipboardList size={30} className="text-slate-300" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pending complaints</span>
                 </div>
              ) : (
                complaints.map(c => (
                   <div 
                     key={c._id} 
                     onClick={() => handleSelectComplaint(c)}
                     className={`p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all group ${
                        selectedComplaint?._id === c._id 
                          ? 'bg-primary-50 border-primary-500 shadow-xl shadow-primary-500/10' 
                          : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
                     }`}
                   >
                      <div className="flex items-start justify-between mb-3">
                         <span className="text-[10px] font-black font-mono text-slate-900 tracking-widest">{c.complaintId}</span>
                         {c.firData ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                         ) : (
                            <ArrowRight size={14} className={`text-slate-300 transition-transform ${selectedComplaint?._id === c._id ? 'translate-x-1 text-primary-500' : 'group-hover:translate-x-1'}`} />
                         )}
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[11px] font-black text-primary-600 uppercase tracking-widest">{c.category}</span>
                         <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                            {c.translatedText || c.originalDescription || c.description}
                         </p>
                      </div>
                   </div>
                ))
              )}
           </div>
        </div>

        {/* Center/Right Pane: Detail & Generation */}
        <div className="xl:col-span-8 flex flex-col gap-6">
           {selectedComplaint ? (
              <div className="card-premium p-8 flex flex-col gap-8 bg-white shadow-2xl shadow-slate-200/50">
                 
                 {/* Complaint Details View */}
                 <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                       <div className="bg-slate-50 p-2 rounded-xl text-slate-500">
                          <FileText size={18} />
                       </div>
                       <div className="flex flex-col">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Case Origin Text</h3>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedComplaint.detectedLanguage || 'Original'} Input</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <p className="text-sm md:text-base font-medium text-slate-700 leading-relaxed p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 italic">
                       "{selectedComplaint.originalDescription || selectedComplaint.description}"
                    </p>

                    {(selectedComplaint.translatedText && selectedComplaint.translatedText !== selectedComplaint.originalDescription) && (
                       <div className="flex flex-col gap-2 pt-2">
                          <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} /> English Translation Target</span>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">
                             {selectedComplaint.translatedText}
                          </p>
                       </div>
                    )}
                 </div>

                 {/* Actions */}
                 <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                    {error && (
                       <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-bold w-full animate-in fade-in">
                         <ShieldAlert size={16} />
                         {error}
                       </div>
                    )}

                    <button
                      onClick={handleGenerate}
                      disabled={loading || attached || selectedComplaint.firData}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/20 transition-all flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                           <span className="animate-pulse">Processing Analysis...</span>
                        </div>
                      ) : (selectedComplaint.firData || attached) ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-400" /> FIR Already Generated
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> Generate FIR from Complaint
                        </>
                      )}
                    </button>
                 </div>
              </div>
           ) : (
              <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center bg-slate-50/50">
                 <div className="flex flex-col items-center gap-4 text-slate-400">
                   <div className="bg-slate-100 p-4 rounded-full text-slate-300">
                     <Search size={32} />
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-black uppercase tracking-widest text-slate-400">Select a Case</span>
                      <span className="text-xs font-medium text-slate-400">Choose a pending incident from the left log to begin algorithmic parsing.</span>
                   </div>
                 </div>
              </div>
           )}

           {/* Output Pane */}
           <AnimatePresence>
             {(result || selectedComplaint?.firData) && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="flex flex-col gap-6 relative"
               >
                  {/* Summary section */}
                  <div className="card-premium bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 md:p-10 relative overflow-hidden group shadow-2xl shadow-primary-500/30">
                     <div className="absolute -right-8 -top-8 text-white/5 transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                       <Bot size={150} />
                     </div>
                     
                     <div className="relative z-10 flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Sparkles size={16} className="text-primary-300" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary-200">Executive AI Summary</span>
                          </div>
                       </div>
                       <p className="text-lg md:text-xl font-bold leading-relaxed tracking-tight text-white/95">
                          {(result || selectedComplaint.firData).summary}
                       </p>
                     </div>
                  </div>

                  {/* FIR Draft section */}
                  <div className="card-premium bg-white p-8 md:p-10 shadow-2xl shadow-slate-200/50 flex flex-col gap-8 border border-slate-100">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-3">
                           <div className="bg-slate-900 p-2 rounded-xl text-white">
                              <FileText size={18} />
                           </div>
                           <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">FIR Draft Generated</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleCopy}
                            className="px-4 py-2.5 bg-slate-50 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          >
                            {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy Text'}
                          </button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] font-black text-slate-400 capitalize px-2 w-max uppercase tracking-widest">Classification</span>
                           <span className="text-sm font-bold text-slate-900 px-2">{(result || selectedComplaint.firData).case_type}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] font-black text-rose-400 capitalize px-2 w-max uppercase tracking-widest">Extracted Priority</span>
                           <span className="text-sm font-bold text-slate-900 px-2">{(result || selectedComplaint.firData).priority}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] font-black text-slate-400 capitalize px-2 w-max flex items-center gap-1 uppercase tracking-widest"><Clock size={10} /> Temporality</span>
                           <span className="text-sm font-bold text-slate-900 px-2 leading-snug">{(result || selectedComplaint.firData).time}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] font-black text-slate-400 capitalize px-2 w-max flex items-center gap-1 uppercase tracking-widest"><MapPin size={10} /> Spatial Vector</span>
                           <span className="text-sm font-bold text-slate-900 px-2 leading-snug">{(result || selectedComplaint.firData).location}</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 pt-2">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">FIR Description</span>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-[2rem] border-2 border-dashed border-slate-200">
                          {(result || selectedComplaint.firData).fir_description || "Complaint indicates a reported incident requiring investigation."}
                        </p>
                     </div>

                     {/* Attachment Action */}
                     {result && !selectedComplaint.firData && !attached && (
                        <div className="pt-6 border-t border-slate-100">
                           <button
                             onClick={handleAttachFIR}
                             disabled={attaching}
                             className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
                           >
                             {attaching ? (
                               <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                             ) : (
                               <>
                                 <ShieldCheck size={16} /> Attach FIR to Complaint Dossier
                               </>
                             )}
                           </button>
                        </div>
                     )}
                     
                     {attached && (
                       <div className="pt-6 border-t border-slate-100">
                         <div className="bg-emerald-50 p-4 rounded-xl flex items-center justify-center gap-3 text-emerald-600 text-xs font-black uppercase tracking-widest">
                           <CheckCircle2 size={16} /> FIR Permanently Attached
                         </div>
                       </div>
                     )}

                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AIAssistantPage;
