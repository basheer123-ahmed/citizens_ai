import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import GrievanceMap from '../components/GrievanceMap';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { speak, stopSpeech } from '../utils/speechUtils';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Zap,
  MapPin,
  FileText,
  Activity,
  History,
  Image,
  Cpu,
  Waves,
  Sparkles,
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';
import InteractiveAIBot from '../components/InteractiveAIBot';
import { motion, AnimatePresence } from 'framer-motion';
import { useCitizenLang } from '../context/CitizenLanguageContext';

const VoiceAssistantPage = ({ user }) => {
  const navigate = useNavigate();
  const { t, language } = useCitizenLang();
  // We handle voice language specifically for speech reconition
  const [languageMode, setLanguageMode] = useState(language === 'te' ? 'te-IN' : 'en-IN');
  const isTelugu = languageMode === 'te-IN';

  const {
    isListening,
    transcript: liveTranscript,
    error: micError,
    start: startMic,
    stop: stopMic,
    supported
  } = useSpeechRecognition({
    lang: languageMode,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        processInput(text);
      }
    }
  });

  const [chatHistory, setChatHistory] = useState([]);

  const [grievanceData, setGrievanceData] = useState({
    issueType: 'Awaiting...',
    location: 'Awaiting...',
    description: 'Awaiting...',
    severity: 'Medium',
    status: 'Pending',
    latitude: 17.3850,
    longitude: 78.4867,
    completion_percentage: 0,
    current_step: 0
  });

  const [addressSearch, setAddressSearch] = useState('');
  const [textInput, setTextInput] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const chatEndRef = useRef(null);

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        category: grievanceData.issueType || 'General Grievance',
        description: grievanceData.description || 'Civic issue reported via AI assistant.',
        severity: (grievanceData.severity || 'Medium').toLowerCase(),
        latitude: grievanceData.latitude,
        longitude: grievanceData.longitude,
        address: grievanceData.location || 'Local Area',
        originalDescription: grievanceData.description,
        reportData: grievanceData
      };

      await axios.post(`${API_BASE}/api/complaints`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setSuccess(true);
      speak(isTelugu ? "మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది. ధన్యవాదాలు." : "Your complaint has been successfully registered. Thank you.");
      setTimeout(() => navigate('/user/dashboard'), 3000);
    } catch (err) {
      setError('Submission failed. Please check your network.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const defaultMsg = isTelugu
      ? 'నమస్కారం! నేను మీ పౌర సహాయకుడిని. ఈరోజు మీకు ఎలా సహాయపడగలను?'
      : 'Hello! I am your civic assistant. How can I help you with your local issue today?';

    if (chatHistory.length === 0) {
      setChatHistory([{ role: 'assistant', text: defaultMsg }]);
    }
    return () => stopSpeech();
  }, [languageMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const processInput = async (userInput) => {
    setChatHistory(prev => [...prev, { role: 'user', text: userInput }]);

    try {
      const { data } = await axios.post(`${API_BASE}/api/complaints/voice-chat`, {
        text: userInput,
        context: JSON.stringify(grievanceData),
        lang: languageMode
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (data.updated_grievance) {
        setGrievanceData(prev => {
          const newState = { ...prev };
          
          // Only update if AI provides real data for these specific keys
          const keys = ['issueType', 'location', 'description', 'severity', 'status'];
          keys.forEach(k => {
            if (data.updated_grievance[k] && data.updated_grievance[k] !== 'Awaiting...') {
              newState[k] = data.updated_grievance[k];
            }
          });

          // Metadata updates
          if (data.current_step) newState.current_step = parseInt(data.current_step);
          if (data.completion_percentage !== undefined) newState.completion_percentage = parseInt(data.completion_percentage);
          
          return newState;
        });

        // Trigger Geocode check for map
        const searchLocation = data.map_search_query || data.updated_grievance.location;
        if (searchLocation && searchLocation.length > 3 && searchLocation !== 'Awaiting...') {
           performGeocode(searchLocation);
        }
      }

      const reply = data.assistant_response || (isTelugu ? 'ధన్యవాదాలు, ఇంకేదైనా?' : 'Thank you, anything else?');
      if (autoSpeak && reply) speak(reply, languageMode);
      setChatHistory(prev => [...prev, { role: 'assistant', text: reply }]);

    } catch (err) {
      const fallbackMsg = isTelugu ? 'క్షమించండి, మళ్ళీ చెప్పండి.' : 'Sorry, could you please repeat that?';
      setChatHistory(prev => [...prev, { role: 'assistant', text: fallbackMsg }]);
    }
  };

  const performGeocode = async (searchLocation) => {
    try {
      let query = searchLocation;
      if (!query.toLowerCase().includes('hyderabad')) {
         query += ', Hyderabad, India';
      }
      const geoResp = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      if (geoResp.data && geoResp.data.length > 0) {
        const { lat, lon } = geoResp.data[0];
        setGrievanceData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }));
      } else {
        console.warn("Geocoding returned no results for:", query);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 p-6 md:p-10 overflow-hidden font-sans">
      <header className="relative z-10 mb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/user/dashboard" className="p-3 bg-white hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-primary-600 border border-slate-200 shadow-sm">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex flex-col">
              <div className="bg-[#BBF7D0] py-6 px-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(74,222,128,0.1)] border border-green-200/50 relative overflow-hidden group/header flex-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80]"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover/header:bg-white/40 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col gap-3">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-none uppercase text-[#064E3B]">
                    {t('va_header_title')}
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064E3B]/70 leading-relaxed max-w-xl">
                    {t('va_header_desc')}
                  </p>
                </div>
              </div>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-white rounded-2xl p-1 border border-slate-200 shadow-sm">
              <button onClick={() => setLanguageMode('en-IN')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${!isTelugu ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-slate-400 hover:text-slate-600'}`}>English</button>
              <button onClick={() => setLanguageMode('te-IN')} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${isTelugu ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-slate-400 hover:text-slate-600'}`}>Telugu</button>
            </div>
          </div>
          <div className="h-px w-full bg-slate-200"></div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="card-premium p-8 lg:p-10 flex flex-col gap-10 min-h-[640px] relative bg-white border-none shadow-2xl rounded-[3rem]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className={`w-36 h-36 flex items-center justify-center transition-all duration-700 ${!isListening ? 'ai-breathe' : 'opacity-80'}`}>
                    <InteractiveAIBot />
                  </div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-sm z-30"></div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{t('va_live_support')}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('va_connected')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={isListening ? stopMic : startMic}
                  className={`group relative p-10 rounded-[2.5rem] transition-all duration-700 z-10 ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-[#F8FBF8] text-[#0F1C12] hover:bg-primary-600'}`}
                >
                  {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                </button>
                {micError && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full border border-rose-100">{micError}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-6 h-[400px] overflow-y-auto no-scrollbar pr-4 py-2">
              <AnimatePresence>
                {chatHistory.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[85%] p-6 rounded-[2rem] text-[12px] font-bold shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'}`}>
                      <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-primary-600'}`}>
                        {msg.role === 'user' ? <UserIcon size={12} /> : <Cpu size={12} />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{msg.role === 'assistant' ? t('va_assistant') : t('va_you')}</span>
                      </div>
                      <span>{msg.text}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isListening && liveTranscript && (
                <div className="flex justify-end p-4 mb-2">
                   <div className="bg-slate-50 text-slate-400 text-[11px] font-bold italic px-5 py-3 rounded-2xl border border-slate-100 animate-pulse">
                      "{liveTranscript}..."
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-4 w-full mt-auto pt-6">
              <input
                disabled={isListening}
                type="text"
                placeholder={t('va_describe_ph')}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-500 transition-all shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textInput.trim()) {
                    processInput(textInput.trim());
                    setTextInput('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (textInput.trim()) {
                    processInput(textInput.trim());
                    setTextInput('');
                  }
                }}
                className="bg-[#F8FBF8] text-[#0F1C12] px-8 rounded-[2rem] hover:bg-primary-600 transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="card p-2 rounded-[2.5rem] bg-white shadow-2xl h-[400px] overflow-hidden">
            <GrievanceMap 
               latitude={grievanceData.latitude} 
               longitude={grievanceData.longitude} 
               addressSearch={addressSearch} 
               setAddressSearch={setAddressSearch} 
               address={grievanceData.location} 
               onLocationChange={(lat, lng, addr) => { 
                 setGrievanceData(prev => ({ ...prev, latitude: lat, longitude: lng, location: addr || prev.location })); 
               }} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-premium p-8 rounded-[2.5rem] bg-white shadow-2xl border-none flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-primary-600" size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">{t('va_complaint_details')}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('va_issue_type')}</span>
                    <span className="text-sm font-black text-primary-600 uppercase">{grievanceData.issueType}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('va_loc')}</span>
                    <span className="text-xs font-bold text-slate-700">{grievanceData.location}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('va_severity')}</span>
                    <span className={`text-xs font-black uppercase ${grievanceData.severity === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>{grievanceData.severity}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleFinalSubmit} 
                className={`w-full mt-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all
                  ${success ? 'bg-emerald-500 text-white' : 'bg-[#F8FBF8] text-[#0F1C12] hover:bg-primary-600'}
                `}
              >
                {submitting ? t('va_recording') : (success ? t('va_submitted') : (isTelugu ? 'సమర్పించండి' : t('va_final_sub')))}
              </button>
            </div>

            <div className="card p-8 rounded-[2.5rem] bg-white shadow-2xl flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="text-primary-600" size={18} />
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('va_progress')}</span>
                </div>
                <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">{grievanceData.completion_percentage}%</div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('va_step')} {grievanceData.current_step} {t('va_of')} 5</span>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-primary-600 transition-all duration-500" style={{ width: `${grievanceData.completion_percentage}%` }}></div>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-medium uppercase tracking-widest italic text-center">
                  {grievanceData.completion_percentage === 100 ? t('va_analysis_comp') : t('va_awaiting')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-10 right-10 bg-emerald-500 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-[100]">
            <CheckCircle2 size={24} />
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-widest">{t('va_recorded')}</span>
              <span className="text-[10px] font-bold opacity-90 uppercase">{t('va_recorded_desc')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAssistantPage;
