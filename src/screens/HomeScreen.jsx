import { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import PlaceCard from "../components/PlaceCard";
import { categories } from "../data/puneData";
import { fetchPlaces, fetchEvents } from "../data/api";

export default function HomeScreen({ onPlaceSelect, onSearchClick }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [placesData, eventsData] = await Promise.all([
          fetchPlaces({ category: activeCategory }),
          fetchEvents()
        ]);
        setPlaces(placesData.slice(0, 4));
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to load home data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeCategory]);

  if (loading) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8B3A2A", fontWeight: 600 }}>Loading Pune...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FBF8F3", minHeight: "100%" }}>
      <StatusBar />

      {/* Hero */}
      <div
        style={{
          background: "#8B3A2A",
          padding: "20px 20px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute", top: -20, right: -30,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: -40, left: -20,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
            Namaste, Sourav 👋
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            Explore Pune
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
            The Oxford of the East
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginTop: 14,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              padding: "5px 12px",
              fontSize: 12,
              color: "#fff",
            }}
          >
            ☀️ 32°C · Sunny
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: "#FBF8F3", paddingBottom: 10 }}>
        <div
          onClick={onSearchClick}
          style={{
            margin: "-16px 16px 0",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #EDE8DF",
            padding: "11px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            position: "relative",
            zIndex: 2,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 16, color: "#6B5B52" }}>🔍</span>
          <span style={{ fontSize: 13, color: "#6B5B52", flex: 1 }}>
            Search places, food, events…
          </span>
          <span 
            onClick={(e) => {
              e.stopPropagation();
              onSearchClick({ showFilters: true });
            }}
            style={{ fontSize: 16, color: "#8B3A2A" }}
          >
            ⚙️
          </span>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px 8px", overflowX: "auto" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "7px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: "nowrap",
              flexShrink: 0,
              border: "none",
              cursor: "pointer",
              background: activeCategory === cat ? "#8B3A2A" : "#EDE8DF",
              color: activeCategory === cat ? "#fff" : "#6B5B52",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Popular Spots */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px 10px",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1412" }}>Popular Spots</div>
          <div onClick={onSearchClick} style={{ fontSize: 12, color: "#8B3A2A", cursor: "pointer" }}>See all</div>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "0 16px 16px", overflowX: "auto" }}>
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} onClick={onPlaceSelect} />
          ))}
        </div>
      </div>

      {/* Nearby Events */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 16px 10px",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1412" }}>Nearby Events</div>
          <div 
            onClick={() => alert("Exploring more events in Pune...")}
            style={{ fontSize: 12, color: "#8B3A2A", cursor: "pointer" }}
          >
            More
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, padding: "0 16px 20px" }}>
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => alert(`Event: ${ev.name}\nDate: ${ev.date}\nDescription: ${ev.desc}`)}
              style={{
                flex: 1,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #EDE8DF",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: ev.color === "terracotta" ? "#8B3A2A" : "#3D3680",
                  marginBottom: 3,
                }}
              >
                {ev.date}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1412" }}>{ev.name}</div>
              <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 2 }}>{ev.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
