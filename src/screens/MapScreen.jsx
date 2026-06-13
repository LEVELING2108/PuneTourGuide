import { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import { fetchItinerary, updateStopStatus } from "../data/api";

const TRAVEL_MODES = ["Walking", "Auto", "Driving"];

export default function MapScreen() {
  const [mode, setMode] = useState("Walking");
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStops = async () => {
      setLoading(true);
      try {
        const data = await fetchItinerary();
        // Just take the stops from the first day for the map demo
        if (data.length > 0) {
          setStops(data[0].stops);
        }
      } catch (error) {
        console.error("Failed to load map data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStops();
  }, []);

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

  if (loading) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8B3A2A", fontWeight: 600 }}>Loading map...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FBF8F3", minHeight: "100%" }}>
      <StatusBar />

      {/* Header */}
      <div style={{ background: "#FBF8F3", padding: "10px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1412", flex: 1 }}>
            Heritage Trail
          </div>
          <div style={{ fontSize: 11, color: "#8B3A2A", fontWeight: 600 }}>
            4 stops · 6.2 km
          </div>
        </div>
      </div>

      {/* Schematic Map Canvas */}
      <div
        style={{
          height: 200,
          background: "#EDE8DF",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }}
          viewBox="0 0 375 200"
        >
          {/* Roads */}
          <rect x="0" y="90" width="375" height="9" fill="rgba(255,255,255,0.85)" />
          <rect x="105" y="0" width="8" height="200" fill="rgba(255,255,255,0.7)" />
          <rect x="0" y="145" width="375" height="6" fill="rgba(255,255,255,0.55)" />
          <rect x="215" y="0" width="6" height="200" fill="rgba(255,255,255,0.5)" />
          {/* Grid lines */}
          {[...Array(12)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 18} x2="375" y2={i * 18} stroke="#B4A898" strokeWidth="0.5" />
          ))}
          {[...Array(22)].map((_, i) => (
            <line key={`v${i}`} x1={i * 18} y1="0" x2={i * 18} y2="200" stroke="#B4A898" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Route and pins */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          viewBox="0 0 375 200"
        >
          {/* Dashed route line */}
          <polyline
            points="58,158 113,95 162,95 222,68 264,48"
            stroke="#8B3A2A"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="7,4"
            opacity="0.85"
          />

          {/* Stop 1 — Shaniwar Wada */}
          <circle cx="58" cy="158" r="7" fill="#8B3A2A" stroke="white" strokeWidth="2" />
          <rect x="20" y="136" width="76" height="18" rx="5" fill="#8B3A2A" />
          <text x="58" y="148" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">Shaniwar Wada</text>
          <line x1="58" y1="154" x2="58" y2="158" stroke="#8B3A2A" strokeWidth="1.5" />

          {/* Stop 2 — Dagdusheth */}
          <circle cx="162" cy="95" r="7" fill="#B87318" stroke="white" strokeWidth="2" />
          <rect x="130" y="74" width="62" height="18" rx="5" fill="#B87318" />
          <text x="161" y="86" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">Dagdusheth</text>
          <line x1="162" y1="92" x2="162" y2="95" stroke="#B87318" strokeWidth="1.5" />

          {/* Stop 3 — Vishrambaug (current) */}
          <circle cx="222" cy="68" r="7" fill="#3D3680" stroke="white" strokeWidth="2.5" />
          <rect x="188" y="48" width="68" height="18" rx="5" fill="#3D3680" />
          <text x="222" y="60" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">Vishrambaug</text>
          <line x1="222" y1="65" x2="222" y2="68" stroke="#3D3680" strokeWidth="1.5" />

          {/* Stop 4 — Aga Khan */}
          <circle cx="264" cy="48" r="7" fill="#4A6741" stroke="white" strokeWidth="2" />
          <rect x="226" y="26" width="76" height="18" rx="5" fill="#4A6741" />
          <text x="264" y="38" textAnchor="middle" fontSize="8" fill="white" fontWeight="600">Aga Khan Palace</text>
          <line x1="264" y1="44" x2="264" y2="48" stroke="#4A6741" strokeWidth="1.5" />

          {/* You are here */}
          <circle cx="113" cy="145" r="8" fill="#3D3680" stroke="white" strokeWidth="3" />
          <text x="127" y="140" fontSize="8" fill="#3D3680" fontWeight="700">You</text>
        </svg>
      </div>

      {/* Travel Mode + duration */}
      <div
        style={{
          background: "#fff",
          padding: "12px 16px",
          borderBottom: "1px solid #EDE8DF",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {TRAVEL_MODES.map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              alert(`Recalculating route for ${m} mode...`);
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              background: mode === m ? "#F2EAE7" : "#EDE8DF",
              color: mode === m ? "#8B3A2A" : "#6B5B52",
            }}
          >
            {m}
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#6B5B52" }}>~1h 45m</div>
      </div>

      {/* Stop list */}
      <div style={{ background: "#fff" }}>
        {stops.map((stop) => (
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
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: stop.current ? "#ECEAF8" : "#F2EAE7",
                color: stop.current ? "#3D3680" : "#8B3A2A",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {stop.id}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1412" }}>{stop.name}</div>
              <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 1 }}>
                {stop.distance} · {stop.time}{" "}
                {stop.current && (
                  <span style={{ color: "#3D3680", fontWeight: 600, fontSize: 10 }}>— Up next</span>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleStop(stop.id)}
              style={{
                marginLeft: "auto",
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
        ))}
      </div>
    </div>
  );
}
