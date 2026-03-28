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

const VoiceAssistantPage = ({ user }) => {
  const navigate = useNavigate();
  const [languageMode, setLanguageMode] = useState('te-IN');
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

  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant', text: isTelugu
        ? 'నమస్కారం, ప్రోటోకాల్ ప్రారంభించబడింది. దయచేసి మీ పేరు, వయస్సు మరియు ఫోన్ నంబర్ తెలియజేయండి.'
        : 'Hello, protocol initiated. Please state your Name, Age, and Phone Number to begin.'
    }
  ]);

  const [firData, setFirData] = useState({
    police_station: 'Unknown',
    act_and_section: 'TBD',
    occurrence_details: 'TBD',
    info_type: 'Oral',
    occurrence_place: 'TBD',
    complainant_details: { name: user?.name || '', relative: '', dob: '', nationality: 'Indian', occupation: '', mobile: '', address: '' },
    accused_details: 'Unknown',
    property_details: 'None',
    property_value: '0',
    delay_reason: 'None',
    narrative: '',
    notes: 'None',
    latitude: 17.3850,
    longitude: 78.4867,
    completion_percentage: 0,
    missingFields: ['Police Station', 'Act and Section', 'Occurrence Details', 'Type of Information', 'Place of Occurrence', 'Complainant Details', 'Accused Details', 'Property Details', 'Total Value', 'Delay Reason', 'Narrative', 'Additional Notes']
  });

  const [addressSearch, setAddressSearch] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const chatEndRef = useRef(null);

  const teluguLabelMap = {
    'Police Station': 'పోలీస్ స్టేషన్',
    'Act and Section': 'చట్టం మరియు సెక్షన్',
    'Occurrence Details': 'సంఘటన వివరాలు',
    'Type of Information': 'సమాచారం రకం',
    'Place of Occurrence': 'సంఘటన స్థలం',
    'Complainant Details': 'ఫిర్యాదుదారు వివరాలు',
    'Accused Details': 'నిందితుడి వివరాలు',
    'Property Details': 'ఆస్తి వివరాలు',
    'Total Value': 'మొత్తం విలువ',
    'Delay Reason': 'ఆలస్యానికి కారణం',
    'Narrative': 'ఫిర్యాదు వివరాలు',
    'Additional Notes': 'అదనపు గమనికలు'
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        category: firData.act_and_section || 'General Incident',
        description: firData.narrative || 'Detailed voice report pending final narrative compilation.',
        severity: 'medium',
        latitude: firData.latitude,
        longitude: firData.longitude,
        address: firData.occurrence_place || 'Anantapur District',
        originalDescription: firData.narrative,
        evidenceUrls: files.map(f => `https://simulated-storage.com/${f.name}`),
        firData: {
          summary: `Official AI-Intake for ${firData.act_and_section || 'General Incident'}`,
          ...firData
        }
      };

      await axios.post(`${API_BASE}/api/complaints`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setSuccess(true);
      speak(isTelugu ? "మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది." : "Your complaint has been successfully registered.");
      setTimeout(() => navigate('/citizen/dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Neural Submission Protocol Failure.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const defaultMsg = isTelugu
      ? 'ప్రోటోకాల్ ప్రారంభించబడింది. నేను మీ AI ఇన్వెస్టిగేషన్ ఆఫీసర్‌ని. మీకు ఎలా సహాయపడగలను?'
      : 'Protocol initialized. I am your AI Detective. How can I help you today?';

    if (chatHistory.length <= 1) {
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
        context: JSON.stringify(firData),
        lang: languageMode
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (data.updated_fir) {
        setFirData(prev => {
          const newMissingFields = data.missing_fields || prev.missingFields;
          const newPercentage = data.completion_percentage !== undefined && data.completion_percentage !== 0
            ? data.completion_percentage
            : Math.round(((12 - newMissingFields.length) / 12) * 100);

          return {
            ...prev,
            ...data.updated_fir,
            act_and_section: data.updated_fir.act_and_section || prev.act_and_section,
            latitude: data.updated_fir.latitude || prev.latitude,
            longitude: data.updated_fir.longitude || prev.longitude,
            missingFields: newMissingFields,
            completion_percentage: newPercentage
          };
        });

        const searchLocation = data.map_search_query;
        if (searchLocation && searchLocation.length > 3) {
          try {
            const geoResp = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}`);
            if (geoResp.data && geoResp.data.length > 0) {
              const { lat, lon } = geoResp.data[0];
              setFirData(prev => ({
                ...prev,
                latitude: parseFloat(lat),
                longitude: parseFloat(lon)
              }));
            }
          } catch (err) {
            console.error("Geocoding failed:", err);
          }
        }
      }

      const reply = data.assistant_response || (isTelugu ? 'సరే, ఇంకా ఏమైనా చెప్పాలా?' : 'Okay, anything else?');
      if (autoSpeak && reply) speak(reply, languageMode);
      setChatHistory(prev => [...prev, { role: 'assistant', text: reply }]);

    } catch (err) {
      console.error("Neural analysis failed:", err);
      const missing = firData.missingFields[0] || 'Narrative';
      const fallbackMsg = isTelugu ? 'నెట్‌వర్క్ అంతరాయం... మీరు చెప్పినది విన్నాను, దయచేసి కొనసాగించండి.' : 'Network lag... I heard you, please continue.';
      if (autoSpeak) speak(fallbackMsg, languageMode);
      setChatHistory(prev => [...prev, { role: 'assistant', text: fallbackMsg }]);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 p-6 md:p-10 overflow-hidden font-sans">
      <header className="relative z-10 mb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/citizen/dashboard" className="p-3 bg-white hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-primary-600 border border-slate-200 shadow-sm">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Cpu className="text-primary-600 animate-pulse" size={14} />
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Neural Intake Hub v2.0</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase mt-1">Intelligence Portal</h1>
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
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/20"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className={`w-36 h-36 flex items-center justify-center transition-all duration-700 ${!isListening ? 'ai-breathe' : 'opacity-80'}`}>
                    <div className="w-full h-full overflow-visible flex items-center justify-center relative">
                      <InteractiveAIBot />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-sm z-30"></div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Active Neural Intake</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Intake Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <button
                  onClick={isListening ? stopMic : startMic}
                  className={`group relative p-10 rounded-[2.5rem] transition-all duration-700 z-10 ${isListening ? 'bg-rose-500 text-white shadow-[0_10px_40px_rgba(244,63,94,0.3)] scale-110' : 'bg-slate-900 text-white hover:bg-primary-600 shadow-[0_10px_40px_rgba(15,23,42,0.1)] hover:scale-105'}`}
                >
                  {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6 h-[400px] overflow-y-auto no-scrollbar pr-4 py-2">
              <AnimatePresence>
                {chatHistory.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[85%] p-6 rounded-[2rem] text-[12px] font-bold tracking-wide leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-blue-200/50' : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'}`}>
                      <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-primary-600'}`}>
                        {msg.role === 'user' ? <UserIcon size={12} /> : <Cpu size={12} />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{msg.role === 'assistant' ? 'AI OFFICER' : 'CITIZEN'}</span>
                      </div>
                      <span>{msg.text}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-4 w-full mt-auto pt-6">
              <input
                disabled={isListening} type="text" placeholder="TYPE OR SPEAK..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest outline-none focus:border-primary-500 transition-all shadow-sm"
                onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { processInput(e.target.value); e.target.value = ''; } }}
              />
              <button className="bg-slate-900 text-white px-8 rounded-[2rem] hover:bg-primary-600 transition-all shadow-lg active:scale-95">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-8">
          <div className="card p-2 rounded-[2.5rem] bg-white shadow-2xl border-none h-[400px] overflow-hidden">
            <div className="w-full h-full rounded-[2.25rem] overflow-hidden relative">
              <GrievanceMap latitude={firData.latitude} longitude={firData.longitude} addressSearch={addressSearch} setAddressSearch={setAddressSearch} address={firData.occurrence_place} onLocationChange={(lat, lng, addr) => { setFirData(prev => ({ ...prev, latitude: lat, longitude: lng, occurrence_place: addr || prev.occurrence_place })); }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-premium p-8 text-slate-900 rounded-[2.5rem] bg-white shadow-2xl border-none flex flex-col justify-between">
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-primary-600" size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Dossier Summary</span>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Act & Section</span>
                    <span className="text-sm font-black text-primary-600">{firData.act_and_section}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occurrence Details</span>
                    <span className="text-xs font-bold text-slate-700">{firData.occurrence_details}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Accused Details</span>
                    <span className="text-xs font-medium text-slate-500 italic">{firData.accused_details}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleFinalSubmit} disabled={submitting || success} className={`w-full mt-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${success ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-primary-600 shadow-slate-200'}`}>
                {submitting ? 'Processing...' : (success ? 'Submitted' : (isTelugu ? 'సమర్పించండి' : 'Commit Protocol'))}
              </button>
            </div>

            <div className="card p-8 rounded-[2.5rem] bg-white shadow-2xl border-none flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2">
                  <Zap className="text-primary-600" size={18} />
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Intake Progress</span>
                </div>
                <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">{firData.completion_percentage}%</div>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Data Points</span>
                <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[160px] pr-2">
                  {firData.missingFields.map((f, idx) => (
                    <span key={idx} className="px-3 py-2 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-xl border border-slate-100">{isTelugu ? (teluguLabelMap[f] || f) : f}</span>
                  ))}
                </div>
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
              <span className="text-sm font-black uppercase tracking-widest">Protocol Committed</span>
              <span className="text-[10px] font-bold opacity-90 uppercase">Official FIR recorded in Central Ledger.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAssistantPage;
