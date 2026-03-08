function GlassCard({ children, className = "", onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-[2.5rem] ${onClick ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
