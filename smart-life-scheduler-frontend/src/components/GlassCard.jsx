function GlassCard({ children, className = "", onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/[0.04] backdrop-blur-[32px] border border-white/[0.15] shadow-[0_16px_40px_rgba(0,0,0,0.6)] rounded-[2.5rem] transition-all duration-500 ${onClick ? 'cursor-pointer hover:bg-white/[0.08] hover:border-white/30' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
