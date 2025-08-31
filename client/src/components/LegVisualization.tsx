import {
  Wind,
  Waves,
  Ship,
  TrendingUp,
  TrendingDown,
  ArrowUp,
} from "lucide-react";
import GlassCard from "./GlassCard";

// Define the Leg interface based on your Redux slice
interface Leg {
  leg: number;
  vesselBearing: number;
  baseSpeedKnots: number;
  adjustSpeedKnots: number;
  weather: {
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    waveDirection: number;
  };
  performanceInsight: string;
}

interface Props {
  leg: Leg;
}

const LegVisualization = ({ leg }: Props) => {
  const isSpeedAdjustedUp = leg.adjustSpeedKnots > leg.baseSpeedKnots;

  return (
    <GlassCard className="h-full">
      <h3 className="text-xl font-semibold text-white mb-2">
        Leg {leg.leg} Details
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        Visual analysis of vessel performance and weather impact.
      </p>

      {/* Weather Interaction Visual */}
      <div className="bg-gray-900/60 rounded-lg p-6 mb-6 flex justify-center items-center h-48 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-blue-900/20 water-animation"></div>

        {/* Vessel Icon - Rotated to its bearing */}
        <div
          className="z-10 text-center"
          title={`Vessel Bearing: ${leg.vesselBearing}°`}
        >
          <Ship
            size={40}
            className="text-white mx-auto transition-transform duration-500"
            style={{ transform: `rotate(${leg.vesselBearing}deg)` }}
          />
          <p className="text-xs font-bold text-white mt-1">
            {leg.vesselBearing}°
          </p>
        </div>

        {/* Wind Arrow */}
        <div
          className="absolute z-20"
          style={{
            transform: `rotate(${leg.weather.windDirection}deg) translate(0, -60px)`,
          }}
          title={`Wind: ${leg.weather.windSpeed} kts @ ${leg.weather.windDirection}°`}
        >
          <ArrowUp size={24} className="text-cyan-300/80" />
        </div>

        {/* Wave Arrow */}
        <div
          className="absolute z-20"
          style={{
            transform: `rotate(${leg.weather.waveDirection}deg) translate(0, -80px)`,
            opacity: leg.weather.waveHeight > 0 ? 1 : 0,
          }}
          title={`Waves: ${leg.weather.waveHeight}m @ ${leg.weather.waveDirection}°`}
        >
          <ArrowUp size={32} className="text-blue-400/70" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Speed Analysis */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Speed</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {leg.adjustSpeedKnots}
            </span>
            <span className="text-gray-400">kts</span>
            <span
              className={`flex items-center text-xs font-semibold ${
                isSpeedAdjustedUp ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isSpeedAdjustedUp ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              ({leg.baseSpeedKnots} kts base)
            </span>
          </div>
        </div>

        {/* Weather Details */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Conditions</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-cyan-300">
              <Wind size={16} />
              <span className="text-white font-semibold">
                {leg.weather.windSpeed} kts
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Waves size={16} />
              <span className="text-white font-semibold">
                {leg.weather.waveHeight} m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insight */}
      <div>
        <p className="text-gray-400 text-sm mb-2">Performance Insight</p>
        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded">
          <p className="text-blue-200 text-sm">{leg.performanceInsight}</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default LegVisualization;
