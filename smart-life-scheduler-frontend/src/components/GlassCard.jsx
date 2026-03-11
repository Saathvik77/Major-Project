function GlassCard({ children, className = "", onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/[0.03] backdrop-blur-[24px] border border-white/10 shadow-2xl rounded-[2.5rem] transition-all duration-500 ${onClick ? 'cursor-pointer hover:bg-white/[0.08] hover:border-white/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
