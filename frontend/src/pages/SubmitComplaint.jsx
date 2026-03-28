import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ComplaintForm from '../components/ComplaintForm';

const SubmitComplaint = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto">
      <header className="header-box flex flex-col gap-4 relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 -mr-20 -mt-20 blur-[100px] rounded-full group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-3">
            <Link to="/citizen/dashboard" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white border border-white/5">
              <ArrowLeft size={18} />
            </Link>
            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Police Portal: Intelligence</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase">Report Incident</h1>
          <p className="text-sm font-medium text-slate-400 max-w-2xl uppercase tracking-widest leading-relaxed">
            Provide tactical details and digital evidence for prioritized enforcement response.
          </p>
        </div>
      </header>

       <div className="w-full">
         <ComplaintForm user={user} onSuccess={() => navigate('/citizen/dashboard')} />
       </div>
    </div>
  );
};

export default SubmitComplaint;
