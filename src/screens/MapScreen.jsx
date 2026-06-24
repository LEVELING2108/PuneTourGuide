import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StatusBar from "../components/StatusBar";
import { fetchPlaces, fetchItinerary, updateStopStatus, deleteStopFromItinerary, addStopToItinerary } from "../data/api";
import { translations } from "../data/translations";
import { categories } from "../data/puneData";
import { calculateDistance } from "../utils/location";

const TRAVEL_MODES = ["Walking", "Auto", "Driving"];

// Recenter helper component
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function MapScreen({ userLocation, userLanguage }) {
  const [mode, setMode] = useState("Walking");
  const [activeFilter, setActiveFilter] = useState("All");
  const [stops, setStops] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([18.5194, 73.8553]); // Default Shaniwar Wada
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [routeStats, setRouteStats] = useState({ distanceKm: 0, durationSec: 0 });
  const [completedStopId, setCompletedStopId] = useState(null);

  const t = translations[userLanguage] || translations.English;

  // Custom marker creators to avoid Leaflet asset path resolution issues in Vite
  const createCustomIcon = (color, emoji) =>
    L.divIcon({
      html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25); font-size: 16px;">${emoji}</div>`,
      className: "custom-pin-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

  const userIcon = L.divIcon({
    html: `<div style="position: relative;">
            <div style="background-color: #3D3680; width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 8px rgba(61,54,128,0.6);"></div>
            <div style="position: absolute; top: -2px; left: -2px; background-color: #3D3680; width: 22px; height: 22px; border-radius: 50%; opacity: 0.3; animation: pulse 1.5s infinite ease-in-out;"></div>
           </div>`,
    className: "user-location-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch itinerary stops
        const itineraryData = await fetchItinerary();
        if (itineraryData && itineraryData.length > 0) {
          setStops(itineraryData[0].stops || []);
        }

        // Fetch all tourist places
        const placesData = await fetchPlaces({ category: activeFilter });
        setPlaces(placesData || []);
      } catch (error) {
        console.error("Failed to load map data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeFilter]);

  // Clear selected place if filter category changes
  useEffect(() => {
    setSelectedPlace(null);
  }, [activeFilter]);

  const toggleStop = async (id) => {
    const stop = stops.find((s) => s.id === id);
    if (!stop) return;

    try {
      const updated = await updateStopStatus(id, !stop.done);
      if (updated.done) {
        setCompletedStopId(id);
        setTimeout(() => setCompletedStopId(null), 1000);
      }
      setStops((prev) =>
        prev.map((s) => (s.id === id ? { ...s, done: updated.done } : s))
      );
    } catch (error) {
      console.error("Failed to toggle stop:", error);
    }
  };

  const handleDeleteStop = async (id) => {
    if (confirm(userLanguage === "Marathi" ? "तुम्हाला हा थांबा काढून टाकायचा आहे का?" : "Are you sure you want to remove this stop?")) {
      try {
        await deleteStopFromItinerary(id);
        setStops((prev) => prev.filter((s) => s.id !== id));
      } catch (error) {
        console.error("Failed to delete stop:", error);
        alert("Failed to delete stop");
      }
    }
  };

  const handleAddPlaceToItinerary = async (place) => {
    try {
      const itinerary = await fetchItinerary();
      const day1 = itinerary.find(d => d.day === 1);
      if (!day1) throw new Error("Day 1 itinerary day not found");

      const newStop = await addStopToItinerary({
        itineraryDayId: day1.id,
        name: place.name,
        name_mr: place.name_mr || place.name,
        time: "TBD",
        desc: place.description,
        desc_mr: place.description_mr || place.description,
        dotColor: "#8B3A2A",
        tags: [{ label: place.category, type: place.category.toLowerCase() }]
      });

      setStops((prev) => [...prev, newStop]);
      alert(userLanguage === "Marathi" ? `${place.name_mr || place.name} सहलीत जोडले गेले!` : `${place.name} added to your Day 1 itinerary!`);
    } catch (error) {
      console.error("Failed to add stop from map popup:", error);
      alert(userLanguage === "Marathi" ? "सहलीत जोडण्यात अडचण आली." : "Failed to add to itinerary.");
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Heritage":
        return "#8B3A2A"; // terracotta
      case "Temple":
        return "#B87318"; // amber
      case "Nature":
        return "#4A6741"; // sage/green
      case "Food":
        return "#15803D"; // green
      case "Wellness":
        return "#0369A1"; // sky
      default:
        return "#6B5B52";
    }
  };

  // Build points for a route if we have itinerary stops that map to database places
  const routePoints = stops
    .map((stop) => {
      const matchedPlace = places.find(
        (p) => p.name.toLowerCase() === stop.name.toLowerCase()
      );
      if (matchedPlace?.latitude && matchedPlace?.longitude) {
        return [matchedPlace.latitude, matchedPlace.longitude];
      }
      return null;
    })
    .filter(Boolean);

  // Dynamic Routing Logic & Mode Scenario Calculations
  let points = [];
  let isItineraryRoute = false;

  if (stops.length > 0) {
    points = routePoints;
    isItineraryRoute = true;
  } else if (selectedPlace?.latitude && selectedPlace?.longitude) {
    if (userLocation?.latitude && userLocation?.longitude) {
      points = [
        [userLocation.latitude, userLocation.longitude],
        [selectedPlace.latitude, selectedPlace.longitude]
      ];
    }
  }

  // Calculate dynamic physical distance
  let calculatedDistance = 0;
  if (points.length > 1) {
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dist = calculateDistance(p1[0], p1[1], p2[0], p2[1]);
      if (dist !== null) {
        calculatedDistance += dist;
      }
    }
  }

  // Fetch dynamic road route from OSRM
  useEffect(() => {
    if (points.length < 2) {
      setRouteGeometry([]);
      setRouteStats({ distanceKm: 0, durationSec: 0 });
      return;
    }

    const fetchRoute = async () => {
      try {
        const profile = mode === "Walking" ? "foot" : "driving";
        const coordsStr = points.map(p => `${p[1]},${p[0]}`).join(";");
        const url = `https://router.project-osrm.org/route/v1/${profile}/${coordsStr}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("OSRM routing request failed");
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteGeometry(coords);

          const distanceKm = route.distance / 1000;
          let durationSec = route.duration;
          if (mode === "Auto") {
            durationSec = durationSec * 1.25; // Auto-rickshaw slow-traffic adjustment
          }
          setRouteStats({ distanceKm, durationSec });
        }
      } catch (err) {
        console.error("OSRM Routing error:", err);
        // Fallback to straight lines
        setRouteGeometry(points);
        let fallbackDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const dist = calculateDistance(p1[0], p1[1], p2[0], p2[1]);
          if (dist !== null) fallbackDistance += dist;
        }
        const speed = mode === "Walking" ? 4.5 : mode === "Auto" ? 20 : 25;
        const durationSec = (fallbackDistance / speed) * 3600;
        setRouteStats({ distanceKm: fallbackDistance, durationSec });
      }
    };

    fetchRoute();
  }, [points, mode]);

  // Travel time estimation according to Pune city speeds
  const getDurationLabel = () => {
    const distance = routeStats.distanceKm > 0 ? routeStats.distanceKm : calculatedDistance;
    const duration = routeStats.durationSec > 0 ? routeStats.durationSec : 0;

    if (distance === 0) {
      return mode === "Walking" ? "~1h 45m" : mode === "Auto" ? "~30m" : "~25m";
    }

    const mins = Math.round(duration / 60);
    if (mins < 1) return "< 1m";
    if (mins < 60) return `~${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `~${hrs}h ${remainingMins}m` : `~${hrs}h`;
  };

  const getSubHeaderLabel = () => {
    const distance = routeStats.distanceKm > 0 ? routeStats.distanceKm : calculatedDistance;
    if (stops.length > 0) {
      return `${stops.length} ${t.stops} · ${distance > 0 ? distance.toFixed(1) : "6.2"} km`;
    }
    if (selectedPlace) {
      const name = userLanguage === "Marathi" && selectedPlace.name_mr ? selectedPlace.name_mr : selectedPlace.name;
      return `${name} · ${distance > 0 ? `${distance.toFixed(1)} km` : "Calculating..."}`;
    }
    return `${places.length} ${t.popularSpots}`;
  };

  const getGoogleMapsDirUrl = () => {
    if (points.length < 2) return "";
    const origin = `${points[0][0]},${points[0][1]}`;
    const destination = `${points[points.length - 1][0]},${points[points.length - 1][1]}`;
    
    let waypoints = "";
    if (points.length > 2) {
      waypoints = points.slice(1, -1).map(p => `${p[0]},${p[1]}`).join("|");
    }
    
    const travelModeMap = {
      Walking: "walking",
      Auto: "driving",
      Driving: "driving"
    };
    const googleMode = travelModeMap[mode] || "driving";
    
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}&travelmode=${googleMode}`;
  };

  return (
    <div style={{ background: "#FBF8F3", height: "100%", display: "flex", flexDirection: "column" }}>
      <StatusBar />

      {/* Header */}
      <div style={{ background: "#FBF8F3", padding: "10px 16px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1412", flex: 1 }}>
            {stops.length > 0 ? t.heritageTrail : t.map}
          </div>
          <div style={{ fontSize: 11, color: "#8B3A2A", fontWeight: 600 }}>
            {getSubHeaderLabel()}
          </div>
        </div>
      </div>

      {/* Interactive Category Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "0 16px 10px",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
        className="no-scrollbar"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              border: "1.5px solid",
              borderColor: activeFilter === cat ? "#8B3A2A" : "#EDE8DF",
              background: activeFilter === cat ? "#8B3A2A" : "#fff",
              color: activeFilter === cat ? "#fff" : "#6B5B52",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Leaflet Map View */}
      <div
        style={{
          height: 240,
          position: "relative",
          zIndex: 1,
          borderBottom: "1px solid #EDE8DF",
        }}
      >
        {loading && places.length === 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(237,236,232,0.8)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8B3A2A",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {t.loadingMap}
          </div>
        ) : null}

        <style>{`
          .leaflet-container { font-family: inherit; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.4; }
            50% { transform: scale(1.2); opacity: 0; }
            100% { transform: scale(0.9); opacity: 0.4; }
          }
          @keyframes bounceUp {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            50% { transform: translateY(-15px) scale(1.2); opacity: 1; }
            100% { transform: translateY(-30px) scale(1); opacity: 0; }
          }
        `}</style>

        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <RecenterMap center={mapCenter} />

          {/* User Location Marker */}
          {userLocation?.latitude && userLocation?.longitude && (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{userLanguage === "Marathi" ? "तुम्ही येथे आहात" : "You are here"}</div>
              </Popup>
            </Marker>
          )}

          {/* Dynamic Places Markers */}
          {places
            .filter((p) => p.latitude && p.longitude)
            .map((place) => (
              <Marker
                key={place.id}
                position={[place.latitude, place.longitude]}
                icon={createCustomIcon(getCategoryColor(place.category), place.emoji || "📍")}
              >
                <Popup>
                  <div style={{ minWidth: 150, padding: "2px 0", fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{place.emoji}</span>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1412", lineHeight: 1.2 }}>
                        {userLanguage === "Marathi" && place.name_mr ? place.name_mr : place.name}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "#6B5B52", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
                      <span>⭐ {place.rating?.toFixed(1)}</span>
                      <span>•</span>
                      <span>{userLanguage === "Marathi" ? (translations.Marathi[place.category.toLowerCase()] || place.category) : place.category}</span>
                    </div>
                    
                    {stops.some(s => s.name.toLowerCase() === place.name.toLowerCase()) ? (
                      <button
                        onClick={() => {
                          const stop = stops.find(s => s.name.toLowerCase() === place.name.toLowerCase());
                          if (stop) handleDeleteStop(stop.id);
                        }}
                        style={{
                          width: "100%",
                          background: "#F2EAE7",
                          color: "#8B3A2A",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ❌ {userLanguage === "Marathi" ? "थांबा काढा" : "Remove Stop"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddPlaceToItinerary(place)}
                        style={{
                          width: "100%",
                          background: "#8B3A2A",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        📅 {userLanguage === "Marathi" ? "सहलीत जोडा" : "Add to Itinerary"}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Connected route line (road geometry or straight fallback) */}
          {(routeGeometry.length > 0 ? routeGeometry : points).length > 1 && (
            <Polyline 
              positions={routeGeometry.length > 0 ? routeGeometry : points} 
              color={isItineraryRoute ? "#8B3A2A" : "#3D3680"} 
              weight={isItineraryRoute ? 3.5 : 4.5} 
              dashArray={isItineraryRoute ? "5, 5" : "0"} 
            />
          )}
        </MapContainer>
      </div>

      {/* Interactive Routing Card */}
      {points.length > 1 && (
        <div
          style={{
            background: "#fff",
            margin: "0 16px 10px",
            borderRadius: 14,
            border: "1px solid #EDE8DF",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            zIndex: 5
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F2EAE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {mode === "Walking" ? "🚶" : mode === "Auto" ? "🛺" : "🚗"}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1412" }}>
                {isItineraryRoute ? (userLanguage === "Marathi" ? "सहल वारसा मार्ग" : "Active Itinerary Trail") : (userLanguage === "Marathi" ? "थेट मार्ग शोध" : "Direct Navigator")}
              </div>
              <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 2 }}>
                {routeStats.distanceKm > 0 ? `${routeStats.distanceKm.toFixed(1)} km` : "..."} · {getDurationLabel()}
              </div>
            </div>
          </div>
          <button
            onClick={() => window.open(getGoogleMapsDirUrl(), '_blank')}
            style={{
              background: "#8B3A2A",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "7px 12px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            🧭 {userLanguage === "Marathi" ? "मार्गदर्शन" : "Navigate"} ↗
          </button>
        </div>
      )}

      {/* Travel Mode buttons */}
      <div
        style={{
          background: "#fff",
          padding: "10px 16px",
          borderBottom: "1px solid #EDE8DF",
          display: "flex",
          alignItems: "center",
          gap: 8,
          zIndex: 2,
        }}
      >
        {TRAVEL_MODES.map((modeId) => (
          <button
            key={modeId}
            onClick={() => {
              setMode(modeId);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: mode === modeId ? "#F2EAE7" : "#EDE8DF",
              color: mode === modeId ? "#8B3A2A" : "#6B5B52",
              transition: "all 0.2s",
            }}
          >
            {t[modeId.toLowerCase()]}
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#6B5B52", fontWeight: 500 }}>
          {getDurationLabel()}
        </div>
      </div>

      {/* Scrollable Places / Stops List Panel */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#fff",
        }}
        className="no-scrollbar"
      >
        {stops.length > 0 ? (
          // Render Itinerary Stops if active
          stops.map((stop) => {
            const isAnimating = completedStopId === stop.id;
            return (
              <div
                key={stop.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: "1px solid #EDE8DF",
                  transform: isAnimating ? "scale(1.03)" : "scale(1)",
                  background: isAnimating ? "#EBF0E8" : "transparent",
                  transition: "all 0.3s ease",
                  position: "relative"
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: stop.current ? "#ECEAF8" : "#F2EAE7",
                    color: stop.current ? "#3D3680" : "#8B3A2A",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {stop.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1412" }}>
                    {userLanguage === "Marathi" && stop.name_mr ? stop.name_mr : stop.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 2 }}>
                    {stop.time}
                    {stop.current && (
                      <span style={{ color: "#3D3680", fontWeight: 600, fontSize: 10, marginLeft: 6 }}>
                        — {userLanguage === "Marathi" ? "पुढचा थांबा" : "Up next"}
                      </span>
                    )}
                  </div>
                  {isAnimating && (
                    <span style={{ 
                      position: "absolute", 
                      right: 76, 
                      top: "35%", 
                      fontSize: 12, 
                      fontWeight: 700,
                      color: "#2E8B57",
                      animation: "bounceUp 1s ease forwards" 
                    }}>
                      🎉 +50 Pts!
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => toggleStop(stop.id)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: stop.done ? "none" : "1.5px solid #EDE8DF",
                      background: stop.done ? "#4A6741" : "transparent",
                      color: stop.done ? "#fff" : "transparent",
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: "none",
                      background: "#F2EAE7",
                      color: "#8B3A2A",
                      fontSize: 11,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          // Fallback: Render beautifully filtered places when itinerary is empty
          places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            return (
              <div
                key={place.id}
                onClick={() => {
                  setSelectedPlace(place);
                  if (place.latitude && place.longitude) {
                    setMapCenter([place.latitude, place.longitude]);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: "1px solid #EDE8DF",
                  cursor: "pointer",
                  background: isSelected ? "#F2EAE7" : "#fff",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#FBF8F3";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#fff";
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: place.bgColor || "#F2EAE7",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {place.emoji || "📍"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1412" }}>
                    {userLanguage === "Marathi" && place.name_mr ? place.name_mr : place.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 2 }}>
                    ⭐ {place.rating} · {place.address || place.category}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: isSelected ? "#fff" : "#8B3A2A",
                    fontWeight: 600,
                    background: isSelected ? "#8B3A2A" : "#F2EAE7",
                    padding: "4px 8px",
                    borderRadius: 6,
                    transition: "all 0.2s"
                  }}
                >
                  {isSelected ? (userLanguage === "Marathi" ? "निवडलेले" : "Selected") : (userLanguage === "Marathi" ? "पहा" : "View")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
