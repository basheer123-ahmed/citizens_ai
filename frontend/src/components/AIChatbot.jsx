import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../config/api';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the Citizen Care AI Assistant. How can I help you today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    const newMsgs = [...messages, { text: userMsg, isBot: false }];
    setMessages(newMsgs);
    setInputMessage('');

    // Simulated typing indicator (could be improved visually)
    const typingIndicatorIndex = newMsgs.length;
    setMessages([...newMsgs, { text: "...", isBot: true, isTyping: true }]);

    try {
      // Send message and history to backend (filtering out temporary indicators)
      const sanitizedHistory = messages
        .filter(m => !m.isTyping && m.text !== "...")
        .map(m => ({
          role: m.isBot ? 'assistant' : 'user',
          content: m.text
        }));

      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {})
        }
      };

      const { data } = await axios.post(`${API_BASE}/api/chat`, { 
        message: userMsg,
        history: sanitizedHistory 
      }, config);
      
      setMessages(prev => {
        // Remove typing indicator and add real response
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, { text: data.reply, isBot: true }];
      });
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isTyping);
        return [...filtered, { text: "Error connecting to AI Assistant Server.", isBot: true }];
      });
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/40 hover:scale-105 active:scale-95 transition-all z-40 group flex items-center justify-center border-4 border-white"
      >
        <Bot size={28} className="group-hover:text-primary-400 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-[2rem] shadow-4xl border border-slate-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Bot size={20} className="text-primary-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black tracking-tight text-sm uppercase">AI Assistant</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 hover:bg-rose-500 hover:text-white rounded-xl transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-white">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex flex-col gap-1 max-w-[85%] ${msg.isBot ? 'self-start' : 'self-end'}`}
                >
                  <div className={`p-4 rounded-2xl text-[13px] font-medium leading-relaxed
                    ${msg.isBot 
                      ? 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-sm' 
                      : 'bg-primary-600 text-white rounded-tr-sm shadow-md'}`}
                  >
                    {msg.text.split('\n').map((line, j) => (
                      <span key={j} className={line.startsWith('- **') ? 'block mt-1' : ''}>
                        {line}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-50 px-4 py-3 rounded-2xl text-[13px] font-medium outline-none focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all border border-slate-100"
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-300 shadow-xl shadow-slate-900/10"
              >
                <Send size={16} className="-ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
