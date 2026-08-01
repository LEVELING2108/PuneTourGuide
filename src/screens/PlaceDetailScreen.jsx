import { useState } from "react";
import StatusBar from "../components/StatusBar";
import { addStopToItinerary, toggleSavePlace, fetchItinerary } from "../data/api";
import { calculateDistance, formatDistance } from "../utils/location";
import { translations } from "../data/translations";

export default function PlaceDetailScreen({ place, onBack, userLocation, userLanguage }) {
  const [isSaved, setIsSaved] = useState(place?.isSaved || false);

  if (!place) return null;

  const t = translations[userLanguage] || translations.English;

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

  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToItinerary = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      // 1. Fetch current itinerary to find the real ID for "Day 1"
      let day1Id = null;
      try {
        const itinerary = await fetchItinerary();
        const day1 = Array.isArray(itinerary) ? itinerary.find(d => d.day === 1) : null;
        if (day1) day1Id = day1.id;
      } catch (e) {
        console.warn("Could not fetch itinerary day1, backend fallback will handle it:", e);
      }

      // 2. Add the stop using the dynamic ID or fallback
      await addStopToItinerary({
        itineraryDayId: day1Id,
        name: place.name,
        name_mr: place.name_mr || place.name,
        time: "TBD",
        desc: place.description || "",
        desc_mr: place.description_mr || place.description || "",
        dotColor: "#8B3A2A",
        tags: [{ label: place.category || "Heritage", type: (place.category || "heritage").toLowerCase() }]
      });

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 3000);
    } catch (error) {
      console.error("Failed to add to itinerary:", error);
      alert(userLanguage === "Marathi" ? "सहलीत जोडण्यात अडचण आली." : "Failed to add to itinerary. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div style={{ background: "#fff", height: "100%", overflowY: "auto" }}>
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
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1C1412" }}>
              {userLanguage === "Marathi" && place.name_mr ? place.name_mr : place.name}
            </div>
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
            { val: place.estYear, lbl: t.estYear },
            { val: place.entryFee, lbl: t.entryFee },
            { val: place.visitTime, lbl: t.visitTime },
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
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1412", marginBottom: 6 }}>{t.about}</div>
        <div style={{ fontSize: 12, color: "#6B5B52", lineHeight: 1.6 }}>
          {userLanguage === "Marathi" && place.description_mr ? place.description_mr : place.description}
        </div>

        {/* Info rows */}
        <InfoRow icon="🕐" text={place.hours} />
        {place.phone !== "—" && (
          <a href={`tel:${place.phone}`} style={{ textDecoration: 'none' }}>
            <InfoRow icon="📞" text={place.phone} />
          </a>
        )}
        {place.accessible && <InfoRow icon="♿" text={t.info.accessible} />}
        {place.guidedTours && <InfoRow icon="🎙️" text={t.info.guided} />}

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
              {t.directions}
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
              {t.share}
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
            <div style={{ fontSize: 20 }}>🔖</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: isSaved ? "#8B3A2A" : "#1C1412", marginTop: 3 }}>
              {isSaved ? t.saved : t.save}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToItinerary}
          disabled={isAdding}
          style={{
            width: "100%",
            background: isAdded ? "#15803D" : isAdding ? "#A855F7" : "#8B3A2A",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: 14,
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
            marginTop: 16,
            cursor: isAdding ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
        >
          {isAdded ? (
            userLanguage === "Marathi" ? "✓ सहलीत जोडले गेले!" : "✓ Added to Day 1 Itinerary!"
          ) : isAdding ? (
            userLanguage === "Marathi" ? "जोडत आहे..." : "Adding..."
          ) : (
            `📅 ${t.addToPlan}`
          )}
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
