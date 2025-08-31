import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  MapPin,
  Wind,
  Thermometer,
  Eye,
  Compass,
  Waves,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import useCosts from "../hooks/useCosts";
import { useAppDispatch, useAppSelector } from "../hooks/app";
import useVoyage from "../hooks/useVoyage";
import { useNavigate } from "react-router-dom";
import useWeather from "../hooks/useWeather";
import { sendRandomLocationUpdate, socket } from "../lib/socket";
import { addAlert } from "../store/slices/alertSlice";

const CaptainDashboard = () => {
  const { selected: voyage } = useAppSelector((store) => store.voyage);
  const { analysis: voyageAnalysis } = useAppSelector((store) => store.costs);
  const { realtime, forecast } = useAppSelector((store) => store.weather);
  const [activeTab, setActiveTab] = useState("weather");
  const [location] = useState<{
    lat: number;
    lon: number;
  } | null>({
    lat: 12.2502,
    lon: 64.3372,
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selected } = useAppSelector((store) => store.vessel);
  if (!selected) {
    navigate("/auth", {
      replace: true,
    });
  }
  const { getVoyageByVessel } = useVoyage();
  const { getVoyageAnalysis } = useCosts();
  const { getRealTimeWeather, getForecastData } = useWeather();
  const { user } = useAppSelector((store) => store.auth);

  useEffect(() => {
    // Listen for the 'new-alert' event
    socket.on("new-alert", (data: any) => {
      dispatch(addAlert(data));
    });

    // Cleanup on unmount to prevent multiple listeners
    return () => {
      socket.off("new-alert");
    };
  }, []);

  useEffect(() => {
    const getLocation = async () => {
      if (!location?.lat || !location?.lon) return;
      await getRealTimeWeather(location?.lat, location?.lon);
      await getForecastData(location.lat, location.lon);
    };

    getLocation();
  }, []);

  useEffect(() => {
    const fetchVoyageData = async () => {
      await getVoyageByVessel(selected!.id);
    };
    fetchVoyageData();
  }, [selected]);

  useEffect(() => {
    if (!voyage) return;
    const fetchVoyageAnalysisData = async () => {
      await getVoyageAnalysis(voyage.id, 550);
    };
    fetchVoyageAnalysisData();
  }, [voyage]);

  const getRiskLevel = (
    windSpeed: number,
    waveHeight: number,
    visibility: number
  ) => {
    if (windSpeed > 25 || waveHeight > 4 || visibility < 5) return "high";
    if (windSpeed > 15 || waveHeight > 2.5 || visibility < 10) return "medium";
    return "low";
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      default:
        return "text-green-400 bg-green-500/20 border-green-500/30";
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentRisk = getRiskLevel(
    realtime?.windSpeed,
    2.1,
    realtime?.visibility
  );

  const transformedForecast = forecast?.map((item) => ({
    day: new Date(item.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    temperature: item.temperature,
    precipitation: item.precipitation,
    windSpeed: item.windSpeed,
    // waveHeight: item.waveHeight || 2.1, // If not provided, use default
  }));

  // Custom chart theme for dark mode
  const chartTheme = {
    grid: "#374151",
    text: "#d1d5db",
    tooltip: {
      backgroundColor: "rgba(17, 24, 39, 0.95)",
      border: "1px solid #374151",
      color: "#f9fafb",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Captain Dashboard
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Vessel: {voyage?.vessel_name}
            </span>
            <span>IMO: {voyage?.vessel_imo_number}</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                voyage?.status === "active"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : voyage?.status === "planned"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }`}
            >
              {voyage?.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Map Section */}
        <div className="xl:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white">
              Current voyage? Route
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              ETD: {formatDate(voyage?.etd)} → ETA: {formatDate(voyage?.eta)}
            </p>
          </div>
          <div className="p-4 w-full object-cover">
            <img
              src="https://www.shutterstock.com/image-vector/city-map-navigation-gps-navigator-260nw-2449090905.jpg"
              className="w-full object-cover max-h-80"
              alt="img"
            />
          </div>
        </div>

        {/* Current Weather Panel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Wind className="w-5 h-5 mr-2" />
              Current Weather
            </h2>
            <div
              className={`inline-block px-3 py-1 rounded-lg text-xs font-medium mt-2 border ${getRiskColor(
                currentRisk
              )}`}
            >
              {currentRisk.toUpperCase()} RISK
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <Thermometer className="w-5 h-5 text-orange-400 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {realtime?.temperature}°C
                  </div>
                  <div className="text-xs text-gray-400">Temperature</div>
                </div>
              </div>
              <div className="flex items-center bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <Wind className="w-5 h-5 text-blue-400 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {realtime?.windSpeed}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getWindDirection(realtime?.windDirection)}
                  </div>
                </div>
              </div>
              <div className="flex items-center bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <Eye className="w-5 h-5 text-purple-400 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {realtime?.visibility}
                  </div>
                  <div className="text-xs text-gray-400">Visibility</div>
                </div>
              </div>
              <div className="flex items-center bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <Waves className="w-5 h-5 text-teal-400 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-white">2.1 m</div>
                  <div className="text-xs text-gray-400">Wave Height</div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Humidity:</span>
                  <span className="font-medium text-white">
                    {realtime?.humidity}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pressure:</span>
                  <span className="font-medium text-white">
                    {realtime?.pressure} hPa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cloud Cover:</span>
                  <span className="font-medium text-white">
                    {realtime?.cloudCover}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Precipitation:</span>
                  <span className="font-medium text-white">
                    {realtime?.precipitation} mm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voyage Summary */}
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Distance</p>
              <p className="text-2xl font-bold text-white">
                {voyageAnalysis?.summary.totalDistanceNm.toFixed(2)} nm
              </p>
            </div>
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Duration</p>
              <p className="text-2xl font-bold text-white">
                {voyageAnalysis?.summary.totalEstimatedDurationDays.toFixed(2)}{" "}
                days
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Fuel Consumption</p>
              <p className="text-2xl font-bold text-white">
                {voyageAnalysis?.summary.totalEstimatedFuelTons.toFixed(2)} tons
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Fuel Cost</p>
              <p className="text-2xl font-bold text-white">
                $
                {voyageAnalysis?.summary.totalEstimatedFuelCost.toLocaleString()}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              $
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Charts */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl">
        <div className="p-4 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">
            7-Day Weather forecast
          </h2>
          <div className="flex space-x-1">
            {["weather", "wind", "waves"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-blue-500/30 text-blue-300 border border-blue-400/50 backdrop-blur-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {(() => {
                // Transform the forecast data for charts
                const transformedForecast =
                  forecast?.map((item) => ({
                    day: new Date(item.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                    temperature: item.temperature,
                    precipitation: item.precipitation,
                    windSpeed: item.windSpeed,
                    visibility: item.visibility,
                    waveHeight: 2.1, // Placeholder, replace with real wave height if available
                  })) || [];

                switch (activeTab) {
                  case "weather":
                    return (
                      <LineChart data={transformedForecast}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip contentStyle={chartTheme.tooltip} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#fbbf24"
                          strokeWidth={3}
                          name="Temperature (°C)"
                        />
                        <Line
                          type="monotone"
                          dataKey="precipitation"
                          stroke="#60a5fa"
                          strokeWidth={3}
                          name="Precipitation (mm)"
                        />
                      </LineChart>
                    );
                  case "wind":
                    return (
                      <AreaChart data={transformedForecast}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip contentStyle={chartTheme.tooltip} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="windSpeed"
                          stroke="#06b6d4"
                          fill="#06b6d4"
                          fillOpacity={0.3}
                          name="Wind Speed (kt)"
                        />
                      </AreaChart>
                    );
                  case "waves":
                    return (
                      <BarChart data={transformedForecast}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip contentStyle={chartTheme.tooltip} />
                        <Legend />
                        <Bar
                          dataKey="waveHeight"
                          fill="#14b8a6"
                          name="Wave Height (m)"
                        />
                      </BarChart>
                    );
                  default:
                    return (
                      <LineChart data={transformedForecast}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip contentStyle={chartTheme.tooltip} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#fbbf24"
                          strokeWidth={3}
                          name="Temperature (°C)"
                        />
                        <Line
                          type="monotone"
                          dataKey="precipitation"
                          stroke="#60a5fa"
                          strokeWidth={3}
                          name="Precipitation (mm)"
                        />
                      </LineChart>
                    );
                }
              })()}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Navigation Recommendations */}
      <div className="relative mt-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl">
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Compass className="w-5 h-5 mr-2" />
            Navigation Recommendations
          </h2>
          <div>
            <button
              className="text-white bg-green-500/50 px-5 py-2 rounded-md cursor-pointer"
              onClick={() => {
                if (!user || !voyage) return;
                sendRandomLocationUpdate(user?.role, voyage.id);
              }}
            >
              Get Alerts
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 bg-white/5 rounded-lg p-4 backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">
                  Optimal Speed: 12 knots
                </p>
                <p className="text-sm text-gray-400">
                  Current weather conditions allow for efficient cruising speed.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 bg-white/5 rounded-lg p-4 backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">Weather Advisory</p>
                <p className="text-sm text-gray-400">
                  Moderate weather expected in 48 hours. Consider speed
                  adjustment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptainDashboard;
