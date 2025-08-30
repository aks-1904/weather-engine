const TabButton = ({ id, label, icon: Icon, isActive, onClick }: any) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "hover:bg-white/5 text-gray-400 hover:text-white"
            }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

export default TabButton
