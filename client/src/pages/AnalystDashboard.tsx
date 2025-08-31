import { useState, useEffect, useRef } from "react";
import {
  Ship,
  Route,
  BarChart3,
  Fuel,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Navigation,
  Compass,
  DollarSign,
  Clock,
  Activity,
} from "lucide-react";
import L from "leaflet";
import TabButton from "../components/TabButton";
import GlassCard from "../components/GlassCard";
import useVessel from "../hooks/useVessel";
import useVoyage from "../hooks/useVoyage";
import { useAppSelector } from "../hooks/app";
import { useDispatch } from "react-redux";
import { setSelectedVoyage } from "../store/slices/voyagesSlice";
import useCosts from "../hooks/useCosts";

// Mock data based on your interfaces
const mockUser = {
  id: "1",
  username: "analyst_john",
  email: "john@maritime.com",
  role: "analyst" as const,
};

const mockVoyageAnalysis = {
  summary: {
    voyage_id: "voyage1",
    totalDistanceNm: 3458,
    totalEstimatedDurationDays: 8.2,
    totalEstimatedFuelTons: 245.6,
    totalEstimatedFuelCost: 147360,
    averageFuelConsumptionTonsPerNm: 0.071,
  },
  legs: [
    {
      leg: 1,
      startWaypoint: { lat: 40.7128, lon: -74.006 },
      endWaypoint: { lat: 51.5074, lon: -0.1278 },
      distanceNm: 3458,
      vesselBearing: 65,
      baseSpeedKnots: 18.5,
      adjustSpeedKnots: 16.2,
      estimatedDurationHours: 196.8,
      weather: {
        windSpeed: 15.2,
        windDirection: 225,
        waveHeight: 2.1,
        waveDirection: 230,
      },
      fuelConsumptionTones: 245.6,
      fuelCosts: 147360,
      performanceInsight:
        "Moderate headwinds expected, recommend speed reduction for fuel efficiency",
    },
  ],
};

const Dashboard = () => {
  const { fetchAll: fetchAllVessels } = useVessel();
  const { fetchAll: fetchAllVoyages, selected } = useVoyage();

  useEffect(() => {
    const fetchData = async () => {
      await fetchAllVessels();
      await fetchAllVoyages();
    };

    fetchData();
  }, []);

  const { vessels } = useAppSelector((store) => store.vessel);
  const { voyages } = useAppSelector((store) => store.voyage);

  const [activeTab, setActiveTab] = useState("vessels");
  const dispatch = useDispatch();
  const mapRef = useRef(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current) {
      // Prevent re-initialization
      if ((mapRef.current as any)._leaflet_id) {
        (mapRef.current as any)._leaflet_id = null;
      }

      const map = L.map(mapRef.current).setView([40.7128, -74.006], 4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const polylines: L.Polyline[] = [];

      voyages.forEach((voyage) => {
        if (voyage?.route_waypoints.length > 1) {
          const latlngs: [number, number][] = voyage.route_waypoints.map(
            (wp): [number, number] => [wp.lat, wp.lon]
          );

          const polyline = L.polyline(latlngs, {
            color: voyage.status === "active" ? "#10b981" : "#3b82f6",
            weight: 3,
            opacity: 0.8,
          }).addTo(map);

          polylines.push(polyline);

          voyage.route_waypoints.forEach((wp, idx) => {
            L.marker([wp.lat, wp.lon] as [number, number])
              .bindPopup(
                `${voyage.vessel_name} - ${idx === 0 ? "Start" : "End"}`
              )
              .addTo(map);
          });
        }
      });

      if (polylines.length > 0) {
        const allLatLngs = polylines.flatMap(
          (polyline) => polyline.getLatLngs() as L.LatLng[]
        );
        map.fitBounds(L.latLngBounds(allLatLngs));
      }
    }
  }, [activeTab]);

  const renderVessels = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Vessel Management</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Add Vessel
        </button>
      </div>

      <div className="grid gap-4">
        {vessels.map((vessel) => (
          <GlassCard key={vessel.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Ship className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {vessel.name}
                  </h3>
                  <p className="text-gray-400">IMO: {vessel.imo_number}</p>
                  <p className="text-gray-500 text-sm">
                    Created: {new Date(vessel.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                  <Eye size={18} />
                </button>
                <button className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                  <Edit3 size={18} />
                </button>
                <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  const renderVoyages = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Voyage Management</h2>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          Create Voyage
        </button>
      </div>

      <div className="grid gap-4">
        {voyages.map((voyage) => (
          <div
            key={voyage.id}
            onClick={() => {
              dispatch(setSelectedVoyage(voyage));
            }}
          >
            <GlassCard
              key={voyage.id}
              className={`${
                selected?.id === voyage.id && "bg-gray-900/70"
              } cursor-pointer hover:bg-gray-900/70`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      voyage.status === "active"
                        ? "bg-green-500/20"
                        : voyage.status === "completed"
                        ? "bg-blue-500/20"
                        : "bg-orange-500/20"
                    }`}
                  >
                    <Route
                      className={`${
                        voyage.status === "active"
                          ? "text-green-400"
                          : voyage.status === "completed"
                          ? "text-blue-400"
                          : "text-orange-400"
                      }`}
                      size={24}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {voyage.vessel_name}
                    </h3>
                    <p className="text-gray-400">
                      IMO: {voyage.vessel_imo_number}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          voyage.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : voyage.status === "completed"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-orange-500/20 text-orange-400"
                        }`}
                      >
                        {voyage.status.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ETD: {new Date(voyage.etd).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ETA: {new Date(voyage.eta).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                  <Eye size={18} />
                </button>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Voyage Analytics</h2>

      {selected && (
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-xl font-semibold text-white mb-4">
              Voyage Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="bg-blue-500/20 p-3 rounded-lg mb-2">
                  <Navigation className="text-blue-400 mx-auto" size={24} />
                </div>
                <p className="text-gray-400 text-sm">Distance</p>
                <p className="text-white font-semibold">
                  {mockVoyageAnalysis.summary.totalDistanceNm} nm
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-500/20 p-3 rounded-lg mb-2">
                  <Clock className="text-emerald-400 mx-auto" size={24} />
                </div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-white font-semibold">
                  {mockVoyageAnalysis.summary.totalEstimatedDurationDays.toFixed(
                    1
                  )}{" "}
                  days
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-500/20 p-3 rounded-lg mb-2">
                  <Fuel className="text-orange-400 mx-auto" size={24} />
                </div>
                <p className="text-gray-400 text-sm">Fuel</p>
                <p className="text-white font-semibold">
                  {mockVoyageAnalysis.summary.totalEstimatedFuelTons} tons
                </p>
              </div>
              <div className="text-center">
                <div className="bg-red-500/20 p-3 rounded-lg mb-2">
                  <DollarSign className="text-red-400 mx-auto" size={24} />
                </div>
                <p className="text-gray-400 text-sm">Cost</p>
                <p className="text-white font-semibold">
                  $
                  {mockVoyageAnalysis.summary.totalEstimatedFuelCost.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-500/20 p-3 rounded-lg mb-2">
                  <Activity className="text-purple-400 mx-auto" size={24} />
                </div>
                <p className="text-gray-400 text-sm">Efficiency</p>
                <p className="text-white font-semibold">
                  {mockVoyageAnalysis.summary.averageFuelConsumptionTonsPerNm.toFixed(
                    3
                  )}{" "}
                  t/nm
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-xl font-semibold text-white mb-4">
              Leg Analysis
            </h3>
            {mockVoyageAnalysis.legs.map((leg) => (
              <div
                key={leg.leg}
                className="border border-gray-700 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-white">
                    Leg {leg.leg}
                  </h4>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                    {leg.distanceNm} nm
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">
                      Speed (Base/Adjusted)
                    </p>
                    <p className="text-white">
                      {leg.baseSpeedKnots} / {leg.adjustSpeedKnots} kts
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white">
                      {leg.estimatedDurationHours.toFixed(1)} hours
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Fuel Consumption</p>
                    <p className="text-white">
                      {leg.fuelConsumptionTones} tons
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Cost</p>
                    <p className="text-white">
                      ${leg.fuelCosts.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Weather Conditions
                    </p>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wind:</span>
                        <span className="text-white">
                          {leg.weather.windSpeed} kts @{" "}
                          {leg.weather.windDirection}°
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Waves:</span>
                        <span className="text-white">
                          {leg.weather.waveHeight}m @{" "}
                          {leg.weather.waveDirection}°
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Performance Insight
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded">
                      <p className="text-blue-200 text-sm">
                        {leg.performanceInsight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      )}

      {!selected && (
        <GlassCard>
          <div className="text-center py-8">
            <BarChart3 className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400">
              Select a voyage from the Voyages tab to view detailed analytics
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  );

  const tabs = [
    { id: "vessels", label: "Vessels", icon: Ship },
    { id: "voyages", label: "Voyages", icon: Route },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Add Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>

      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Compass className="text-blue-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Maritime Analytics
                </h1>
                <p className="text-gray-400">
                  Welcome back, {mockUser.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{mockUser.username}</p>
                <p className="text-gray-400 text-sm capitalize">
                  {mockUser.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={setActiveTab}
            />
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {activeTab === "vessels" && renderVessels()}
        {activeTab === "voyages" && renderVoyages()}
        {activeTab === "analytics" && renderAnalytics()}
      </div>
    </div>
  );
};

export default Dashboard;
