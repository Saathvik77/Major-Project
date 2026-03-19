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
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`rounded-[2rem] transition-all duration-500 relative overflow-hidden group ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
      {...props}
    >
      {/* Top shine line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
        }}
      />

      {/* Mouse-follow glare */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(480px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.07), transparent 50%)`,
        }}
      />

      {/* Hover border brighten */}
      <div
        className="absolute inset-0 rounded-[2rem] pointer-events-none transition-all duration-500"
        style={{
          border: "1px solid rgba(255,255,255,0.0)",
          boxShadow: "inset 0 0 0 0px rgba(255,255,255,0)",
        }}
      />

      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
}

export default GlassCard;