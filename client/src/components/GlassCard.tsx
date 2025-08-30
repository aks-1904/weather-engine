const GlassCard = ({ children, className = "" }: any) => (
    <div
        className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}
    >
        {children}
    </div>
);

export default GlassCard;