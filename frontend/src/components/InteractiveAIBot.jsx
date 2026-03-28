import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import robotImage from '../assets/realistic_robot_white.png';

const InteractiveAIBot = () => {
    const [showGreeting, setShowGreeting] = useState(false);
    const containerRef = useRef(null);
    
    // Smooth high-end spring physics
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const springConfig = { damping: 25, stiffness: 120, mass: 1 };
    
    const rotateX = useSpring(useTransform(mouseY, [0, 1], [15, -15]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-20, 20]), springConfig);
    const translateX = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), springConfig);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowGreeting(true);
            setTimeout(() => setShowGreeting(false), 3000);
        }, 2000); // Trigger greeting after 2 seconds for a faster first impression
        return () => clearTimeout(timer);
    }, []);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-full flex items-center justify-center cursor-none overflow-visible p-4"
            style={{ perspective: '1200px' }}
        >
            {/* Hi! Greeting Bubble */}
            <AnimatePresence>
                {showGreeting && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, y: 0, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: -140, x: 60 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute z-50 bg-white/95 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.1)] px-6 py-3 rounded-3xl rounded-bl-none border border-slate-100 flex items-center gap-2"
                    >
                        <span className="text-[14px] font-black text-slate-800 tracking-wider">Hi! I am ready to help 👋</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* REALISTIC 3D STANDING ROBOT */}
            <motion.div
                style={{ rotateX, rotateY, x: translateX, transformStyle: 'preserve-3d' }}
                animate={{ 
                    y: [0, -12, 0],
                }}
                transition={{ 
                    duration: 4.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
                className="relative w-56 h-56 flex items-center justify-center pointer-events-none"
            >
                {/* The Character Render */}
                <div className="relative w-full h-full">
                    {/* Character Image */}
                    <img 
                        src={robotImage} 
                        alt="Realistic 3D AI Bot" 
                        className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)] select-none"
                    />

                    {/* Artificial Shaking/Waving Motion Aura (Subtle) */}
                    <motion.div 
                        animate={{ rotate: [-2, 2, -2] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 pointer-events-none"
                    />
                </div>

                {/* REALISTIC CONTACT SHADOW */}
                <motion.div 
                    animate={{ 
                        scale: [0.85, 1.1, 0.85], 
                        opacity: [0.15, 0.3, 0.15] 
                    }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-8 w-32 h-6 bg-black rounded-full z-0 blur-xl"
                />
            </motion.div>
        </div>
    );
};

export default InteractiveAIBot;
