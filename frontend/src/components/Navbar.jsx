import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('userInfo');
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'How it Works', path: '/how-it-works' },
    { name: 'AI Intelligence', path: '/ai-intelligence' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group relative z-50">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:-translate-y-0.5">
            <Shield size={22} className="stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">Citizen Care<span className="text-blue-600 font-extrabold text-2xl leading-none">.</span>AI</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 bg-white/50 backdrop-blur-md px-8 py-2.5 rounded-full border border-slate-200/60 shadow-sm">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="text-[13px] font-semibold text-slate-600 hover:text-blue-600 transition-colors tracking-wide"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => navigate(user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'OFFICER' ? '/officer/dashboard' : '/citizen/dashboard')}
                 className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors group"
               >
                 <UserCircle size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                 Dashboard
               </button>
               <div className="h-5 w-px bg-slate-200"></div>
               <button
                 onClick={handleLogout}
                 className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors"
               >
                 Logout
               </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-[14px] font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2">Login</Link>
              <Link to="/register" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-[13.5px] font-semibold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 transform hover:-translate-y-0.5">
                Register <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden relative z-50 text-slate-800 p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full h-screen bg-white z-40 flex flex-col pt-24 px-6 gap-6"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-2xl font-semibold text-slate-800 border-b border-slate-100 pb-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {!user ? (
               <div className="flex flex-col gap-4 mt-4">
                 <Link 
                   to="/login" 
                   className="w-full text-center py-4 rounded-xl border border-slate-200 text-lg font-semibold text-slate-700"
                   onClick={() => setMobileMenuOpen(false)}
                 >
                   Login
                 </Link>
                 <Link 
                   to="/register" 
                   className="w-full text-center py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold shadow-xl shadow-blue-500/20"
                   onClick={() => setMobileMenuOpen(false)}
                 >
                   Register
                 </Link>
               </div>
            ) : (
               <div className="flex flex-col gap-4 mt-4">
                 <button 
                   onClick={() => {
                     setMobileMenuOpen(false);
                     navigate(user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'OFFICER' ? '/officer/dashboard' : '/citizen/dashboard');
                   }}
                   className="w-full text-center py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold shadow-xl shadow-blue-500/20"
                 >
                   Go to Dashboard
                 </button>
                 <button 
                   onClick={() => {
                     setMobileMenuOpen(false);
                     handleLogout();
                   }}
                   className="w-full text-center py-4 rounded-xl border border-slate-200 text-lg font-semibold text-red-500"
                 >
                   Logout
                 </button>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
