import { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import PlaceListItem from "../components/PlaceListItem";
import { categories } from "../data/puneData";
import { fetchPlaces } from "../data/api";

export default function ExploreScreen({ onPlaceSelect }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaces = async () => {
      setLoading(true);
      try {
        const data = await fetchPlaces({ category: activeFilter, q: search });
        setPlaces(data);
      } catch (error) {
        console.error("Failed to load explore data:", error);
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(loadPlaces, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [activeFilter, search]);

  if (loading && places.length === 0) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8B3A2A", fontWeight: 600 }}>Searching Pune...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FBF8F3", minHeight: "100%" }}>
      <StatusBar />

      {/* Header */}
      <div style={{ background: "#FBF8F3", padding: "10px 16px 14px" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1412", marginBottom: 10 }}>
          Explore Pune
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1,
              background: "#EDE8DF",
              borderRadius: 10,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14, color: "#6B5B52" }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Pune…"
              style={{
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 12,
                color: "#1C1412",
                width: "100%",
              }}
            />
          </div>
          <div
            onClick={() => alert("Advanced Filters: Coming soon!")}
            style={{
              width: 36,
              height: 36,
              background: "#8B3A2A",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 16, color: "#fff" }}>☰</span>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: "5px 12px",
              borderRadius: 16,
              fontSize: 11,
              fontWeight: 500,
              flexShrink: 0,
              border: "none",
              cursor: "pointer",
              background: activeFilter === cat ? "#3D3680" : "#EDE8DF",
              color: activeFilter === cat ? "#fff" : "#6B5B52",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Place list */}
      <div style={{ background: "#fff" }}>
        {places.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#6B5B52", fontSize: 13 }}>
            No places found. Try a different search.
          </div>
        ) : (
          places.map((place) => (
            <PlaceListItem key={place.id} place={place} onClick={onPlaceSelect} />
          ))
        )}
      </div>
    </div>
  );
}
