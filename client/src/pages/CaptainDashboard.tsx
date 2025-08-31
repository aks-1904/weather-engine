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

// Mock data based on the interfaces
const mockVoyage = {
  id: "voyage-123",
  vessel_id: "vessel-456",
  status: "active",
  etd: new Date("2025-08-30T08:00:00Z"),
  eta: new Date("2025-09-05T14:30:00Z"),
  routes_waypoints: [
    { lat: 40.7128, lon: -74.006 }, // New York
    { lat: 41.9028, lon: 12.4964 }, // Rome
    { lat: 55.7558, lon: 37.6176 }, // Moscow
  ],
  created_at: new Date("2025-08-29T10:00:00Z"),
  vessel_name: "Atlantic Navigator",
  vessel_imo_number: 1234567,
};

const mockCurrentWeather = {
  temprature: 22,
  humidity: 68,
  windSpeed: 15,
  windDirection: 245,
  pressure: 1013.2,
  visibility: 12,
  cloudCover: 35,
  precipitation: 0,
  weatherCode: 2,
  timestamp: Date.now(),
  location: { lat: 41.2033, lon: -8.4103 },
};

const mockForecastData = [
  {
    day: "Today",
    temp: 22,
    windSpeed: 15,
    waveHeight: 2.1,
    precipitation: 0,
    visibility: 12,
  },
  {
    day: "Tomorrow",
    temp: 24,
    windSpeed: 18,
    waveHeight: 2.8,
    precipitation: 2,
    visibility: 10,
  },
  {
    day: "Day 3",
    temp: 19,
    windSpeed: 22,
    waveHeight: 3.2,
    precipitation: 8,
    visibility: 8,
  },
  {
    day: "Day 4",
    temp: 21,
    windSpeed: 12,
    waveHeight: 1.9,
    precipitation: 0,
    visibility: 15,
  },
  {
    day: "Day 5",
    temp: 25,
    windSpeed: 16,
    waveHeight: 2.4,
    precipitation: 1,
    visibility: 11,
  },
  {
    day: "Day 6",
    temp: 23,
    windSpeed: 20,
    waveHeight: 2.9,
    precipitation: 5,
    visibility: 9,
  },
  {
    day: "Day 7",
    temp: 20,
    windSpeed: 14,
    waveHeight: 2.0,
    precipitation: 0,
    visibility: 13,
  },
];

const mockVoyageAnalysis = {
  summary: {
    voyage_id: "voyage-123",
    totalDistanceNm: 4280,
    totalEstimatedDurationDays: 6.2,
    totalEstimatedFuelTons: 89.5,
    totalEstimatedFuelCost: 52750,
    averageFuelConsumptionTonsPerNm: 0.021,
  },
};

// Leaflet Map Component
const LeafletMap = ({ voyage, currentPosition }: any) => {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet dynamically
    if (typeof window !== "undefined" && !window.L) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => initializeMap();
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    } else if (window.L) {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as any).remove();
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [45.0, -10.0],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });

    // Add dark tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    // Add route waypoints
    voyage.routes_waypoints.forEach((waypoint: any, index: number) => {
      const isStart = index === 0;
      const isEnd = index === voyage.routes_waypoints.length - 1;

      const marker = L.circleMarker([waypoint.lat, waypoint.lon], {
        radius: isStart || isEnd ? 8 : 6,
        fillColor: isStart ? "#10b981" : isEnd ? "#ef4444" : "#3b82f6",
        fillOpacity: 1,
        color: "#ffffff",
        weight: 2,
      }).addTo(map);

      marker.bindPopup(`
        <div class="text-white bg-gray-900 p-2 rounded">
          <strong>${
            isStart
              ? "Start Point"
              : isEnd
              ? "Destination"
              : `Waypoint ${index}`
          }</strong><br/>
          Lat: ${waypoint.lat.toFixed(4)}<br/>
          Lon: ${waypoint.lon.toFixed(4)}
        </div>
      `);
    });

    // Add current position
    if (currentPosition) {
      const currentMarker = L.circleMarker(
        [currentPosition.lat, currentPosition.lon],
        {
          radius: 10,
          fillColor: "#fbbf24",
          fillOpacity: 1,
          color: "#ffffff",
          weight: 3,
        }
      ).addTo(map);

      currentMarker.bindPopup(`
        <div class="text-white bg-gray-900 p-2 rounded">
          <strong>Current Position</strong><br/>
          Lat: ${currentPosition.lat.toFixed(4)}<br/>
          Lon: ${currentPosition.lon.toFixed(4)}
        </div>
      `);

      // Animate the current position marker
      setInterval(() => {
        currentMarker.setRadius(currentMarker.getRadius() === 10 ? 12 : 10);
      }, 1000);
    }

    // Draw route line
    if (voyage.routes_waypoints.length > 1) {
      const routeCoords = voyage.routes_waypoints.map((wp: any) => [
        wp.lat,
        wp.lon,
      ]);
      L.polyline(routeCoords, {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.8,
        dashArray: "10, 10",
      }).addTo(map);
    }

    // Fit map to show all waypoints
    const group = new (L as any).featureGroup();
    voyage.routes_waypoints.forEach((wp: any) => {
      group.addLayer(L.marker([wp.lat, wp.lon]));
    });
    if (currentPosition) {
      group.addLayer(L.marker([currentPosition.lat, currentPosition.lon]));
    }
    map.fitBounds(group.getBounds().pad(0.1));

    mapInstanceRef.current = map;
  };

  return (
    <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden" />
  );
};

const CaptainDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState(mockCurrentWeather);
  const [forecastData, setForecastData] = useState(mockForecastData);
  const [voyage, setVoyage] = useState(mockVoyage);
  const [voyageAnalysis, setVoyageAnalysis] = useState(mockVoyageAnalysis);
  const [activeTab, setActiveTab] = useState("weather");

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
    currentWeather.windSpeed,
    2.1,
    currentWeather.visibility
  );

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
              Vessel: {voyage.vessel_name}
            </span>
            <span>IMO: {voyage.vessel_imo_number}</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                voyage.status === "active"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : voyage.status === "planned"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }`}
            >
              {voyage.status.toUpperCase()}
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
              Current Voyage Route
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              ETD: {formatDate(voyage.etd)} → ETA: {formatDate(voyage.eta)}
            </p>
          </div>
          <div className="p-4">
            <LeafletMap
              voyage={voyage}
              currentPosition={currentWeather.location}
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
                    {currentWeather.temprature}°C
                  </div>
                  <div className="text-xs text-gray-400">Temperature</div>
                </div>
              </div>
              <div className="flex items-center bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <Wind className="w-5 h-5 text-blue-400 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {currentWeather.windSpeed} kt
                  </div>
                  <div className="text-xs text-gray-400">
                    {getWindDirection(currentWeather.windDirection)}
                  </div>
                </div>
              </div>
              <div className="flex items-center bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <Eye className="w-5 h-5 text-purple-400 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {currentWeather.visibility} nm
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
                    {currentWeather.humidity}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pressure:</span>
                  <span className="font-medium text-white">
                    {currentWeather.pressure} hPa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cloud Cover:</span>
                  <span className="font-medium text-white">
                    {currentWeather.cloudCover}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Precipitation:</span>
                  <span className="font-medium text-white">
                    {currentWeather.precipitation} mm
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
                {voyageAnalysis.summary.totalDistanceNm} nm
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
                {voyageAnalysis.summary.totalEstimatedDurationDays} days
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
                {voyageAnalysis.summary.totalEstimatedFuelTons} tons
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
                {voyageAnalysis.summary.totalEstimatedFuelCost.toLocaleString()}
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
            7-Day Weather Forecast
          </h2>
          <div className="flex space-x-1">
            {["weather", "wind", "waves", "visibility"].map((tab) => (
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
                switch (activeTab) {
                  case "weather":
                    return (
                      <LineChart data={forecastData}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#f9fafb",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temp"
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
                      <AreaChart data={forecastData}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#f9fafb",
                          }}
                        />
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
                      <BarChart data={forecastData}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#f9fafb",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="waveHeight"
                          fill="#14b8a6"
                          name="Wave Height (m)"
                        />
                      </BarChart>
                    );
                  case "visibility":
                    return (
                      <LineChart data={forecastData}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#f9fafb",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="visibility"
                          stroke="#a78bfa"
                          strokeWidth={3}
                          name="Visibility (nm)"
                        />
                      </LineChart>
                    );
                  default:
                    return (
                      <LineChart data={forecastData}>
                        <CartesianGrid
                          strokeDasharray="3,3"
                          stroke={chartTheme.grid}
                        />
                        <XAxis dataKey="day" stroke={chartTheme.text} />
                        <YAxis stroke={chartTheme.text} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#f9fafb",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temp"
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
        <div className="p-4 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Compass className="w-5 h-5 mr-2" />
            Navigation Recommendations
          </h2>
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
