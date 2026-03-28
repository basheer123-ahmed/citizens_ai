import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import { Mail, Lock, Shield, ArrowRight, Loader, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      
      if (data.role === 'CITIZEN') navigate('/citizen/dashboard');
      else if (data.role === 'OFFICER') navigate('/officer/dashboard');
      else if (data.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-20 py-12 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-50 opacity-50 blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white shadow-xl shadow-blue-500/30 mb-8 transform hover:scale-105 transition-all">
              <Shield size={28} className="stroke-[2.5]" />
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Welcome Back</h1>
            <p className="text-slate-500 font-medium mt-3">Access the advanced civic intelligence node.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 shadow-inner"
            >
              <div className="w-1 h-6 bg-red-500 rounded-full" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="name@domain.gov"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Security Pin</label>
                <Link to="#" className="text-[11px] font-black text-blue-600 hover:text-blue-700">Recovery</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1 disabled:opacity-70"
            >
              {loading ? (
                <Loader size={24} className="animate-spin" />
              ) : (
                <>
                  Connect Terminal
                  <ArrowRight size={22} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-12 text-sm font-bold text-slate-500">
            Internal identification missing?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 underline underline-offset-8">
              Register Node
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side: Features/Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-900 p-20 text-white relative overflow-hidden">
        {/* Background Graphics */}
        <img 
          src="/images/secure_auth_node_1774208437094.png" 
          alt="AI Security Node" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none mix-blend-overlay" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900/40 pointer-events-none" />

        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-10">
              <Shield size={32} className="text-blue-500" />
              <span className="text-2xl font-black tracking-tight">Citizen Care<span className="text-blue-500">.</span>AI</span>
           </div>
           
           <h2 className="text-5xl font-black leading-tight tracking-tight mb-8">
             Empowering the <br /> 
             <span className="text-blue-500">Future of Justice.</span>
           </h2>
           
           <div className="flex flex-col gap-6 max-w-md">
              {[
                { title: 'Military-Grade Encryption', desc: 'Every data point is hashed and secured across our decentralized node network.' },
                { title: 'Real-Time Intelligence', desc: 'Officers receive actionable insights faster than any traditional legacy system.' },
                { title: 'Transparent Progress', desc: 'Citizens can track every step of their complaint with full accountability.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                   <div className="mt-1">
                      <CheckCircle2 size={18} className="text-blue-500" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="font-black text-sm uppercase tracking-widest text-slate-100">{item.title}</span>
                      <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
           <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Platform Version 4.0.2</span>
           <span className="text-xs font-medium text-slate-600">&copy; {new Date().getFullYear()} AI Police Intelligence Network. All data processed on private sovereign clusters.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
