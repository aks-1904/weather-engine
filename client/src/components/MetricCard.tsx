import { TrendingUp } from "lucide-react";
import GlassCard from "./GlassCard";

const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color = "blue",
}: any) => (
    <GlassCard className="hover:bg-gray-900/60 transition-colors">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className={`text-2xl font-bold text-${color}-400 mt-1`}>{value}</p>
                {trend && (
                    <p className="text-green-400 text-sm flex items-center gap-1 mt-1">
                        <TrendingUp size={14} />
                        {trend}
                    </p>
                )}
            </div>
            <Icon className={`text-${color}-400`} size={32} />
        </div>
    </GlassCard>
);

export default MetricCard;