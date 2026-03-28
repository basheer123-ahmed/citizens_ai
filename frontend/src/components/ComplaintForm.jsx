import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import GrievanceMap from './GrievanceMap';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { Image, MapPin, Send, AlertCircle, CheckCircle2, Search, Mic, MicOff, RotateCcw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const center = { lat: 28.6139, lng: 77.2090 };

const ComplaintForm = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'Potholes',
    description: '',
    severity: 'medium',
    latitude: center.lat,
    longitude: center.lng,
    address: ''
  });
  const [addressSearch, setAddressSearch] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const { 
    isListening, 
    transcript, 
    error: micError, 
    start: startMic, 
    stop: stopMic 
  } = useSpeechRecognition({
    lang: 'te-IN',
    onResult: (text, isFinal) => {
      setFormData(prev => ({ ...prev, description: text }));
      if (isFinal) {
        analyzeText(text);
      }
    }
  });

  const [aiAnalysis, setAiAnalysis] = useState({ detected_language: '', translated_text: '', case_type: '', priority: '', loading: false });

  const analyzeText = async (text) => {
    if (!text || text.length < 10) return null;
    setAiAnalysis(prev => ({ ...prev, loading: true }));
    try {
      const { data } = await axios.post(`${API_BASE}/api/complaints/analyze-complaint`, { text }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const result = {
        detected_language: data.detected_language,
        translated_text: data.translated_text,
        case_type: data.case_type,
        priority: data.priority,
        loading: false
      };
      setAiAnalysis(result);
      return result;
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setAiAnalysis(prev => ({ ...prev, loading: false }));
      return null;
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (micError) {
      setError(micError);
    }
  }, [micError]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.length < 20) {
      setError('Please provide at least 20 characters for the description.');
      return;
    }
    setLoading(true);
    setError('');

    let currentAnalysis = aiAnalysis;
    const analysisResult = await analyzeText(formData.description);
    if (analysisResult) {
      currentAnalysis = analysisResult;
    }

    if (files.length > 0) {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
          const base64 = await fileToBase64(file);
          const { data } = await axios.post(`${API_BASE}/api/vision/verify`, {
            imageBase64: base64,
            category: formData.category,
            description: formData.description
          }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });

          if (!data.match) {
            setError(`AI Validation Failed: ${data.reason}`);
            setLoading(false);
            return;
          }
        } catch (err) {
           console.error("Vision Verification Error:", err);
           setError(err.response?.data?.message || 'AI Image Verification failed. Ensure image is clear.');
           setLoading(false);
           return;
        }
      }
    }

    const payload = {
      ...formData,
      category: aiAnalysis.case_type || formData.category,
      severity: (aiAnalysis.priority || formData.severity).toLowerCase(),
      description: aiAnalysis.translated_text || formData.description,
      originalDescription: formData.description,
      detectedLanguage: aiAnalysis.detected_language || 'English',
      translatedText: aiAnalysis.translated_text || formData.description,
      evidenceUrls: files.map(f => `https://simulated-storage.com/${f.name}`)
    };

    try {
      await axios.post(`${API_BASE}/api/complaints`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-10 lg:p-14 flex flex-col gap-12 border-none shadow-3xl shadow-slate-200/50 rounded-[3rem] bg-white/90 backdrop-blur-xl"
    >
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="status-badge status-success py-3 flex items-center justify-center gap-2 normal-case font-bold"
          >
            <CheckCircle2 size={18} />
            Complaint registered into our system.
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="status-badge status-error py-3 flex items-center justify-center gap-2 normal-case font-bold"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Form Fields */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2 px-1">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Grievance Intelligence</h2>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Categorize and describe the localized incident.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Case Type</label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black text-[11px] text-slate-800 uppercase tracking-widest shadow-sm appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Theft">Theft</option>
                <option value="Missing Person">Missing Person</option>
                <option value="Cyber Crime">Cyber Crime</option>
                <option value="Harassment">Harassment / Threat</option>
                <option value="Accident">Accident</option>
                <option value="Suspicious Activity">Suspicious Activity</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incident Parameters</label>
                 <button
                   type="button"
                   onClick={isListening ? stopMic : startMic}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/20' : 'bg-slate-100 text-primary-500 hover:bg-primary-500 hover:text-white'}`}
                 >
                   {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                   {isListening ? 'Recording Intel...' : 'Neural Voice Input'}
                 </button>
              </div>
              <textarea
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold text-xs text-slate-700 min-h-[160px] resize-none leading-relaxed placeholder:text-slate-300 shadow-sm"
                placeholder="Enter your complaint in Telugu / Hindi / English..."
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onBlur={(e) => analyzeText(e.target.value)}
              />

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 p-5 bg-slate-900 rounded-2xl border border-white/5 shadow-2xl overflow-hidden mt-4"
              >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary-400 animate-pulse"></div>
                      <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest text-white/90">AI Analysis Intelligence</span>
                   </div>
                   <button
                     type="button"
                     disabled={aiAnalysis.loading || !formData.description}
                     onClick={() => analyzeText(formData.description)}
                     className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all disabled:opacity-30"
                     title="Refresh Analysis"
                   >
                     <RotateCcw size={12} className={aiAnalysis.loading ? 'animate-spin' : ''} />
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Detected Language</span>
                      <span className="text-xs font-black text-white uppercase tracking-widest">{aiAnalysis.loading ? 'Analyzing...' : aiAnalysis.detected_language || 'Awaiting Input'}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Case Sentiment</span>
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Calculated</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">AI Predicted Category</span>
                      <span className="text-xs font-black text-primary-400 uppercase tracking-widest">{aiAnalysis.loading ? 'Classifying...' : aiAnalysis.case_type || 'TBD'}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Priority Level</span>
                      <span className="text-xs font-black text-rose-400 uppercase tracking-widest">{aiAnalysis.loading ? 'Triaging...' : aiAnalysis.priority || 'TBD'}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Translated English Script</span>
                   <p className="text-[11px] font-bold text-slate-300 leading-relaxed italic">
                     {aiAnalysis.loading ? 'Generating semantic English version...' : aiAnalysis.translated_text || 'Enter parameters to begin translation...'}
                   </p>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Priority Vector</label>
              <div className="grid grid-cols-3 gap-4">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: level })}
                    className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all active:scale-95 shadow-sm
                      ${formData.severity === level 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600 px-1">Evidence (Optional)</label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3
                  ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
              >
                  <div className={`flex flex-col items-center gap-2 transition-colors ${isDragging ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <Image size={24} className={isDragging ? 'animate-bounce' : ''} />
                    <span className="text-xs font-black uppercase tracking-widest text-center">
                      {isDragging ? 'Drop Protocol Files' : 'Drag & Drop or Click to Upload'}
                    </span>
                    <span className="text-[10px] font-medium opacity-60 uppercase tracking-tighter">Support for JPEG, PNG, WEBP</span>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
              </div>

              {files.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {files.map((file, idx) => (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={idx} 
                      className="relative bg-white border border-slate-200 p-2 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Image size={14} />
                      </div>
                      <div className="flex flex-col max-w-[120px]">
                        <span className="text-[10px] font-black text-slate-900 truncate uppercase mt-0.5">{file.name}</span>
                        <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">{(file.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-full transition-colors"
                      >
                         <AlertCircle size={14} className="rotate-45" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Map Picker */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2 px-1">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Geospatial Locality</h2>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Synchronize precise deployment coordinates.</p>
          </div>

          <div className="flex flex-col gap-5 h-full relative z-0">
             <GrievanceMap 
                latitude={formData.latitude}
                longitude={formData.longitude}
                addressSearch={addressSearch}
                setAddressSearch={setAddressSearch}
                address={formData.address}
                onLocationChange={(lat, lng, addr) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    latitude: lat, 
                    longitude: lng,
                    address: addr || prev.address
                  }));
                }}
             />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 rounded-3xl hover:bg-primary-600 hover:shadow-3xl hover:shadow-primary-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xl shadow-slate-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Commit Grievance Protocol</span>
                  <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white group-hover:text-primary-600 transition-colors">
                    <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ComplaintForm;
