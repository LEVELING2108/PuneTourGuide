import { useState } from "react";
import StatusBar from "../components/StatusBar";
import { addStopToItinerary, toggleSavePlace } from "../data/api";
import { calculateDistance, formatDistance } from "../utils/location";

export default function PlaceDetailScreen({ place, onBack, userLocation }) {
  const [isSaved, setIsSaved] = useState(place?.isSaved || false);

  if (!place) return null;

  const dynamicDistance = userLocation
    ? calculateDistance(userLocation.latitude, userLocation.longitude, place.latitude, place.longitude)
    : null;

  const handleToggleSave = async () => {
    try {
      const updated = await toggleSavePlace(place.id, !isSaved);
      setIsSaved(updated.isSaved);
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };

  const handleAddToItinerary = async () => {
    try {
      await addStopToItinerary({
        itineraryDayId: 1, // Defaulting to Day 1 for now
        name: place.name,
        time: "TBD",
        desc: place.description,
        dotColor: "#8B3A2A",
        tags: [{ label: place.category, type: place.category.toLowerCase() }]
      });
      alert(`${place.name} added to your Day 1 itinerary!`);
    } catch (error) {
      console.error("Failed to add to itinerary:", error);
      alert("Failed to add to itinerary.");
    }
  };

  return (
    <div style={{ background: "#fff", minHeight: "100%" }}>
      <StatusBar light />

      {/* Hero */}
      <div
        style={{
          height: 180,
          background: "linear-gradient(160deg, #C46348 0%, #8B3A2A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 12, left: 12,
            width: 34, height: 34,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ←
        </button>
        {/* Bookmark */}
        <button
          onClick={handleToggleSave}
          style={{
            position: "absolute",
            top: 12, right: 12,
            width: 34, height: 34,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {isSaved ? "❤️" : "🤍"}
        </button>
        <span style={{ fontSize: 64 }}>{place.emoji}</span>
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1C1412" }}>{place.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6B5B52", marginTop: 4 }}>
              📍 {place.address} · {formatDistance(dynamicDistance)}
            </div>
          </div>
          <div
            style={{
              background: "#FDF3E0",
              color: "#B87318",
              padding: "5px 10px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {place.rating?.toFixed(1) || "4.0"} ⭐
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "16px 0" }}>
          {[
            { val: place.estYear, lbl: "Est. year" },
            { val: place.entryFee, lbl: "Entry fee" },
            { val: place.visitTime, lbl: "Visit time" },
          ].map((s) => (
            <div
              key={s.lbl}
              style={{
                background: "#FBF8F3",
                borderRadius: 10,
                padding: "10px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1412" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#6B5B52", marginTop: 2 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* About */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1412", marginBottom: 6 }}>About</div>
        <div style={{ fontSize: 12, color: "#6B5B52", lineHeight: 1.6 }}>{place.description}</div>

        {/* Info rows */}
        <InfoRow icon="🕐" text={place.hours} />
        {place.phone !== "—" && (
          <a href={`tel:${place.phone}`} style={{ textDecoration: 'none' }}>
            <InfoRow icon="📞" text={place.phone} />
          </a>
        )}
        {place.accessible && <InfoRow icon="♿" text="Wheelchair accessible" />}
        {place.guidedTours && <InfoRow icon="🎙️" text="Guided tours available" />}

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <div
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address + " Pune")}`, '_blank')}
            style={{
              flex: 1,
              background: "#FBF8F3",
              borderRadius: 12,
              padding: 10,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 20 }}>🗺️</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#1C1412", marginTop: 3 }}>
              Directions
            </div>
          </div>

          <div
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: place.name,
                  text: `Check out ${place.name} in Pune!`,
                  url: window.location.href,
                }).catch(console.error);
              } else {
                alert("Sharing not supported on this browser.");
              }
            }}
            style={{
              flex: 1,
              background: "#FBF8F3",
              borderRadius: 12,
              padding: 10,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 20 }}>📤</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#1C1412", marginTop: 3 }}>
              Share
            </div>
          </div>

          <div
            onClick={handleToggleSave}
            style={{
              flex: 1,
              background: "#FBF8F3",
              borderRadius: 12,
              padding: 10,
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 20 }}>{isSaved ? "🔖" : "🔖"}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: isSaved ? "#8B3A2A" : "#1C1412", marginTop: 3 }}>
              {isSaved ? "Saved" : "Save"}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToItinerary}
          style={{
            width: "100%",
            background: "#8B3A2A",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: 14,
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
            marginTop: 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          📅 Add to Itinerary
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 0",
        borderTop: "1px solid #EDE8DF",
        fontSize: 12,
        color: "#6B5B52",
      }}
    >
      <span style={{ fontSize: 16, color: "#8B3A2A" }}>{icon}</span>
      {text}
    </div>
  );
}
