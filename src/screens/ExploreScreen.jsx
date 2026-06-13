import { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import PlaceListItem from "../components/PlaceListItem";
import { categories } from "../data/puneData";
import { fetchPlaces } from "../data/api";

export default function ExploreScreen({ onPlaceSelect, initialParams = {} }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(initialParams.showFilters || false);
  const [sortBy, setSortBy] = useState("rating"); // 'rating' or 'name'
  
  // Advanced Filters
  const [onlyAccessible, setOnlyAccessible] = useState(false);
  const [priceFilter, setPriceFilter] = useState("All"); // 'All', 'Free', 'Paid'
  const [onlyTopRated, setOnlyTopRated] = useState(false);

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

  const filteredAndSortedPlaces = [...places]
    .filter(p => {
      if (onlyAccessible && !p.accessible) return false;
      if (onlyTopRated && p.rating < 4.5) return false;
      if (priceFilter === "Free" && p.entryFee !== "Free" && p.entryFee !== "—") return false;
      if (priceFilter === "Paid" && (p.entryFee === "Free" || p.entryFee === "—")) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  if (loading && places.length === 0) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8B3A2A", fontWeight: 600 }}>Searching Pune...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FBF8F3", minHeight: "100%", position: "relative" }}>
      <StatusBar />

      {/* Filter Modal Overlay */}
      {showFilters && (
        <div 
          onClick={() => setShowFilters(false)}
          style={{ 
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", 
            zIndex: 100, display: "flex", alignItems: "flex-end" 
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", 
              padding: "24px 20px 40px", boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
              maxHeight: "80%", overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1C1412" }}>Search Settings</div>
              <button onClick={() => setShowFilters(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            
            {/* Sort Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B5B52", marginBottom: 12 }}>Sort By</div>
              <div style={{ display: "flex", gap: 10 }}>
                {["rating", "name"].map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 12, border: "1.5px solid",
                      borderColor: sortBy === s ? "#8B3A2A" : "#EDE8DF",
                      background: sortBy === s ? "#F2EAE7" : "#fff",
                      color: sortBy === s ? "#8B3A2A" : "#6B5B52",
                      fontSize: 12, fontWeight: 600, textTransform: "capitalize", cursor: "pointer"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B5B52", marginBottom: 12 }}>Price Range</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["All", "Free", "Paid"].map(p => (
                  <button
                    key={p}
                    onClick={() => setPriceFilter(p)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 12, border: "1.5px solid",
                      borderColor: priceFilter === p ? "#8B3A2A" : "#EDE8DF",
                      background: priceFilter === p ? "#F2EAE7" : "#fff",
                      color: priceFilter === p ? "#8B3A2A" : "#6B5B52",
                      fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles Section */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6B5B52", marginBottom: 16 }}>Preferences</div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 14, color: "#1C1412", fontWeight: 500 }}>Wheelchair Accessible</div>
                <button 
                  onClick={() => setOnlyAccessible(!onlyAccessible)}
                  style={{ 
                    width: 44, height: 24, borderRadius: 20, border: "none", cursor: "pointer",
                    background: onlyAccessible ? "#4A6741" : "#EDE8DF",
                    position: "relative", transition: "0.3s"
                  }}
                >
                  <div style={{ 
                    width: 18, height: 18, background: "#fff", borderRadius: "50%",
                    position: "absolute", top: 3, left: onlyAccessible ? 23 : 3, transition: "0.3s"
                  }} />
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, color: "#1C1412", fontWeight: 500 }}>Top Rated (4.5+)</div>
                <button 
                  onClick={() => setOnlyTopRated(!onlyTopRated)}
                  style={{ 
                    width: 44, height: 24, borderRadius: 20, border: "none", cursor: "pointer",
                    background: onlyTopRated ? "#B87318" : "#EDE8DF",
                    position: "relative", transition: "0.3s"
                  }}
                >
                  <div style={{ 
                    width: 18, height: 18, background: "#fff", borderRadius: "50%",
                    position: "absolute", top: 3, left: onlyTopRated ? 23 : 3, transition: "0.3s"
                  }} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowFilters(false)}
              style={{ 
                width: "100%", background: "#8B3A2A", color: "#fff", border: "none", 
                borderRadius: 14, padding: "14px", fontWeight: 600, cursor: "pointer" 
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

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
            onClick={() => setShowFilters(true)}
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
        {filteredAndSortedPlaces.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#6B5B52", fontSize: 13 }}>
            No places found. Try a different search.
          </div>
        ) : (
          filteredAndSortedPlaces.map((place) => (
            <PlaceListItem key={place.id} place={place} onClick={onPlaceSelect} userLocation={userLocation} />
          ))
        )}
      </div>
    </div>
  );
}
