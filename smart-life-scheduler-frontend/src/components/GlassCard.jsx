import React, { useState } from "react";
import { motion } from "framer-motion";

function GlassCard({ children, className = "", onClick, ...props }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`glass-morphism rounded-[2.5rem] transition-colors duration-500 relative overflow-hidden group ${onClick ? 'cursor-pointer hover:bg-white/[0.08]' : ''} ${className}`}
      {...props}
    >
      {/* Dynamic Glare Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.1), transparent 40%)`
        }}
      />
      
      {/* Light border reflection */}
      <div className="absolute inset-0 border border-white/20 rounded-[2.5rem] pointer-events-none group-hover:border-white/40 transition-colors duration-500" />
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
}

export default GlassCard;
