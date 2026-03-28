import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import { Mail, Lock, User, Phone, Calendar, ChevronDown, Shield, ArrowRight, Loader, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CITIZEN',
    dob: '',
    rank: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/register`, formData);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      
      if (data.role === 'CITIZEN') navigate('/citizen/dashboard');
      else if (data.role === 'OFFICER') navigate('/officer/dashboard');
      else if (data.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Features/Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-slate-900 p-20 text-white relative overflow-hidden">
        {/* Background Graphics */}
        <img 
          src="/images/citizen_network_induction_1774208467342.png" 
          alt="Citizen Network Induction" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none mix-blend-overlay" 
        />
        <div className="absolute inset-0 bg-gradient-to-bl from-slate-900 via-slate-900 to-violet-900/40 pointer-events-none" />

        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-10">
              <Shield size={32} className="text-violet-500" />
              <span className="text-2xl font-black tracking-tight">Citizen Care<span className="text-violet-500">.</span>AI</span>
           </div>
           
           <h2 className="text-5xl font-black leading-tight tracking-tight mb-8">
             Your Identity, <br /> 
             <span className="text-violet-500">Modernized.</span>
           </h2>
           
           <div className="flex flex-col gap-8 max-w-md">
              {[
                { title: 'Seamless Citizen Node', desc: 'Securely link your identity to the most advanced civic protection system available.' },
                { title: 'Proactive Alert Logic', desc: 'Receive real-time intelligence feeds customized for your local precinct.' },
                { title: 'Privacy First Architecture', desc: 'Your data is encrypted end-to-end, accessible only via secure cryptographic tokens.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                   <div className="mt-1">
                      <CheckCircle2 size={18} className="text-violet-500" />
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="font-black text-sm uppercase tracking-widest text-slate-100">{item.title}</span>
                      <p className="text-slate-400 font-medium text-xs leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
           <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Protocol Verifier v9.1.4</span>
           <span className="text-xs font-medium text-slate-600">&copy; {new Date().getFullYear()} AI Police Intelligence Network. Secure Induction Cluster.</span>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 lg:flex-[1.5] flex flex-col justify-center items-center px-6 lg:px-20 py-24 relative overflow-hidden bg-slate-50">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-100 opacity-50 blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-2xl bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-900/5 border border-slate-100 relative z-10"
        >
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white shadow-xl shadow-blue-500/30 mb-8 transform hover:scale-105 transition-all">
              <Shield size={28} className="stroke-[2.5]" />
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">New Account Induction</h1>
            <p className="text-slate-500 font-medium mt-3">Register your unique profile protocol within the intelligence network.</p>
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Full Legal Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Email Authority</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  placeholder="john.doe@domain.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Reference</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Vital Chronology</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="dob"
                  type="date"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800 text-slate-400 focus:text-slate-800"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Verification</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 mt-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Active Network Role</label>
              <div className="relative group">
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" size={20} />
                <select
                  name="role"
                  className="w-full pl-6 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white transition-all font-black text-slate-800 appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="CITIZEN">Standard Citizen Node</option>
                  <option value="OFFICER">Officer Access Protocol</option>
                  <option value="ADMIN">System Infrastructure Manager</option>
                </select>
              </div>
            </div>

            {formData.role === 'OFFICER' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-2 md:col-span-2 mt-2">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1">Select Official Rank</label>
                <div className="relative group">
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" size={20} />
                  <select
                    name="rank"
                    className="w-full pl-6 pr-12 py-3.5 bg-white border border-blue-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white transition-all font-black text-slate-800 appearance-none cursor-pointer"
                    required={formData.role === 'OFFICER'}
                    value={formData.rank}
                    onChange={handleChange}
                  >
                    <option value="">Select Rank...</option>
                    <option value="DGP">DGP (Director General of Police)</option>
                    <option value="ADGP">ADGP (Additional Director General)</option>
                    <option value="IG">IG (Inspector General)</option>
                    <option value="DIG">DIG (Deputy Inspector General)</option>
                    <option value="SP">SP (Superintendent of Police)</option>
                    <option value="ASP">ASP (Assistant Superintendent)</option>
                    <option value="DSP">DSP (Deputy Superintendent)</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Sub-Inspector (SI)">Sub-Inspector (SI)</option>
                    <option value="Assistant Sub-Inspector (ASI)">Assistant Sub-Inspector (ASI)</option>
                    <option value="Head Constable">Head Constable</option>
                    <option value="Constable">Constable</option>
                  </select>
                </div>
              </motion.div>
            )}

            <div className="md:col-span-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <Loader size={24} className="animate-spin" />
                ) : (
                  <>
                    Initiate Security Induction
                    <ArrowRight size={22} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center mt-12 text-sm font-bold text-slate-500">
            Already linked to the cluster?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 underline underline-offset-8 transition-all">
              Login to Terminal
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
