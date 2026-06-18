import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StatusBar from "../components/StatusBar";
import { fetchPlaces, fetchItinerary, updateStopStatus } from "../data/api";
import { translations } from "../data/translations";
import { categories } from "../data/puneData";

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

  const toggleStop = async (id) => {
    const stop = stops.find((s) => s.id === id);
    if (!stop) return;

    try {
      const updated = await updateStopStatus(id, !stop.done);
      setStops((prev) =>
        prev.map((s) => (s.id === id ? { ...s, done: updated.done } : s))
      );
    } catch (error) {
      console.error("Failed to toggle stop:", error);
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
            {stops.length > 0 ? `${stops.length} ${t.stops} · 6.2 km` : `${places.length} ${t.popularSpots}`}
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
                  <div style={{ padding: "2px 4px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1412" }}>
                      {userLanguage === "Marathi" && place.name_mr ? place.name_mr : place.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#6B5B52", marginTop: 2 }}>
                      ⭐ {place.rating} · {place.category}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Connected route line for itineraries */}
          {routePoints.length > 1 && (
            <Polyline positions={routePoints} color="#8B3A2A" weight={3} dashArray="5, 5" />
          )}
        </MapContainer>
      </div>

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
          {mode === "Walking" ? "~1h 45m" : mode === "Auto" ? "~30m" : "~25m"}
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
          stops.map((stop) => (
            <div
              key={stop.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom: "1px solid #EDE8DF",
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
              </div>
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
            </div>
          ))
        ) : (
          // Fallback: Render beautifully filtered places when itinerary is empty
          places.map((place) => (
            <div
              key={place.id}
              onClick={() => {
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
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FBF8F3")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
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
                  color: "#8B3A2A",
                  fontWeight: 600,
                  background: "#F2EAE7",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                🛰️ {userLanguage === "Marathi" ? "पहा" : "View"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
