import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, UserPlus, Server, FileText, CheckCircle2 } from 'lucide-react';

const FIRPreviewModal = ({ isOpen, onClose, complaint, user, onAssignClick }) => {
  const [firData, setFirData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && complaint) {
      fetchOrGenerateFIR();
    }
  }, [isOpen, complaint]);

  const fetchOrGenerateFIR = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post(`${API_BASE}/api/fir/generate/${complaint._id}`, {}, config);
      setFirData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve FIR Document.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` }, responseType: 'blob' };
      const res = await axios.get(`${API_BASE}/api/fir/download/${complaint._id}`, config);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${firData?.systemGeneratedId || 'FIR_Document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('PDF Generation Failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen || !complaint) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white w-full max-w-3xl rounded-[2rem] shadow-4xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start p-6 md:p-8 bg-slate-900 text-white z-10">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-400" size={24} />
                  <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Official FIR Preview</h2>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                   <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${firData?.status === 'Assigned' ? 'bg-emerald-500' : 'bg-primary-500 animate-pulse'}`}></div>
                      Status: {firData?.status || 'Processing'}
                   </div>
                   {firData && <span>• REF: <span className="text-white">{firData.systemGeneratedId}</span></span>}
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                <X size={20} />
             </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4 text-slate-400">
                   <Server className="animate-pulse" size={32} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Synthesizing Neural FIR Format...</span>
                </div>
              ) : error ? (
                <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl text-sm font-bold border border-rose-100 uppercase tracking-widest text-center">
                  {error}
                </div>
              ) : firData ? (
                <div className="bg-white border text-sm border-slate-200 shadow-sm p-8 max-w-2xl mx-auto flex flex-col gap-6">
                   <div className="text-center flex flex-col gap-1 border-b-2 border-slate-900 pb-4 mb-2">
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">First Information Report</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{firData.header.departmentName}</p>
                   </div>
                   
                   <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Ref ID: <span className="text-slate-900">{firData.systemGeneratedId}</span></span>
                      <span>Date: <span className="text-slate-900">{new Date(firData.generatedAt).toLocaleString()}</span></span>
                   </div>

                   <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 uppercase tracking-widest w-fit">1. Complainant Details</h4>
                      <p className="text-[11px] font-bold text-slate-600 px-3">
                         Name: {firData.complainantDetails.name} <br/>
                         Contact: {firData.complainantDetails.contactInfo}
                      </p>
                   </div>

                   <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 uppercase tracking-widest w-fit">2. Incident Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-slate-600 px-3">
                          <div><span className="text-slate-400">Type:</span> {firData.incidentDetails.incidentType}</div>
                          <div><span className="text-slate-400">Priority:</span> {firData.priorityLevel}</div>
                          <div className="col-span-2"><span className="text-slate-400">Time:</span> {firData.incidentDetails.dateAndTime}</div>
                          <div className="col-span-2"><span className="text-slate-400">Location:</span> {firData.incidentDetails.location.address}</div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 uppercase tracking-widest w-fit">3. Detailed Description</h4>
                      <p className="text-[11px] font-bold text-slate-700 leading-relaxed uppercase px-3 text-justify">
                         {firData.incidentDetails.description}
                      </p>
                   </div>
                   
                   <div className="flex flex-col gap-2">
                       <h4 className="text-[10px] font-black text-primary-900 bg-primary-50 px-3 py-1 uppercase tracking-widest w-fit border border-primary-100">AI Intelligence Core</h4>
                       <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase px-3 italic border-l-2 border-primary-200 ml-3">
                           {firData.aiSummary}
                       </p>
                   </div>

                   <div className="flex flex-col gap-2 mt-4 border-t border-slate-100 pt-6 items-center">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authenticity Authorized by Neural System</span>
                       <span className="text-[8px] font-bold text-slate-300">Generated automatically securely avoiding tampering</span>
                   </div>
                </div>
              ) : null}
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 shrink-0">
               <div className="flex-1 w-full">
                  <AnimatePresence>
                     {downloadSuccess && (
                       <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                         <CheckCircle2 size={14} /> Download Secured
                       </motion.div>
                     )}
                  </AnimatePresence>
               </div>
               
               <div className="flex items-center gap-3 w-full sm:w-auto">
                 <button 
                   onClick={handleDownload}
                   disabled={!firData || downloading}
                   className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                 >
                   {downloading ? <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin"></div> : <Download size={14} />}
                   {downloading ? 'Compiling...' : 'Download PDF'}
                 </button>
                 
                 {user?.role === 'ADMIN' && (
                   <button 
                     onClick={() => {
                       onClose();
                       onAssignClick(complaint);
                     }}
                     className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
                   >
                     <UserPlus size={14} /> Assign Officer
                   </button>
                 )}
               </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FIRPreviewModal;
