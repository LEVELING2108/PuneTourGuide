import { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import PlaceListItem from "../components/PlaceListItem";
import { fetchPlaces } from "../data/api";

export default function ProfileScreen({ onPlaceSelect }) {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedPlaces = async () => {
      setLoading(true);
      try {
        const data = await fetchPlaces({ isSaved: true });
        setSavedPlaces(data);
      } catch (error) {
        console.error("Failed to load saved places:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSavedPlaces();
  }, []);

  if (loading) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8B3A2A", fontWeight: 600 }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FBF8F3", minHeight: "100%" }}>
      <StatusBar light />

      {/* Profile Header */}
      <div
        style={{
          background: "#8B3A2A",
          padding: "24px 16px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#EDE8DF",
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            border: "3px solid rgba(255,255,255,0.2)",
          }}
        >
          👤
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Sourav Paul</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
          Traveling in Pune · Local Guide
        </div>
      </div>

      {/* Saved Places */}
      <div style={{ padding: "16px 16px 8px", background: "#FBF8F3" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1C1412" }}>Saved Places</div>
        <div style={{ fontSize: 12, color: "#6B5B52", marginTop: 2 }}>
          {savedPlaces.length} locations bookmarked
        </div>
      </div>

      <div style={{ background: "#fff", minHeight: 200 }}>
        {savedPlaces.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1412" }}>No bookmarks yet</div>
            <div style={{ fontSize: 12, color: "#6B5B52", marginTop: 4, padding: "0 40px" }}>
              Explore Pune and save your favorite spots to see them here!
            </div>
          </div>
        ) : (
          savedPlaces.map((place) => (
            <PlaceListItem key={place.id} place={place} onClick={onPlaceSelect} />
          ))
        )}
      </div>

      {/* Stats */}
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #EDE8DF" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#8B3A2A" }}>12</div>
          <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 2 }}>Places Visited</div>
        </div>
        <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #EDE8DF" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#3D3680" }}>4.8</div>
          <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 2 }}>Avg. Rating</div>
        </div>
      </div>
    </div>
  );
}
