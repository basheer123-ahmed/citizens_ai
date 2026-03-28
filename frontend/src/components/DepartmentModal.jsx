import React, { useState } from 'react';
import { X, Building, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../config/api';

const DepartmentModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_BASE}/api/departments`, { 
        name, 
        categoriesHandled: categories.split(',').map(c => c.trim()).filter(c => c)
      }, config);
      setSuccess(true);
      setTimeout(() => {
        onUpdate();
        onClose();
        setSuccess(false);
        setName('');
        setCategories('');
      }, 1500);
    } catch (err) {
      console.error('Error creating department:', err);
      alert(err.response?.data?.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
          <X size={20} />
        </button>

        <div className="p-10 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
             <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                <Building size={24} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-2">New Department</h2>
             <p className="text-xs text-slate-500 font-medium">Initialize a new municipal infrastructure branch.</p>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} />
               </div>
               <div className="flex flex-col">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-sm">Branch Deployed</span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Syncing infrastructure records...</span>
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Department Name</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Public Works, Sanitation" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:text-slate-300 cursor-text"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Categories (Comma Separated)</label>
                <textarea 
                  required
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="Potholes, Garbage Overflow, etc." 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:text-slate-300 min-h-[100px] resize-none cursor-text"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-600 hover:shadow-2xl hover:shadow-primary-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Deploy Infrastructure'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentModal;
