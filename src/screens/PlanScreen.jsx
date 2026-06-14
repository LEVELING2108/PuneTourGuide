import { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import { tagStyles } from "../data/tokens";
import { fetchItinerary } from "../data/api";
import { translations } from "../data/translations";

export default function PlanScreen({ userLocation, userLanguage }) {
  const [activeDay, setActiveDay] = useState(0);
  const [itineraryDays, setItineraryDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = translations[userLanguage] || translations.English;

  useEffect(() => {
    const loadItinerary = async () => {
      setLoading(true);
      try {
        const data = await fetchItinerary();
        setItineraryDays(data);
      } catch (error) {
        console.error("Failed to load itinerary data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadItinerary();
  }, []);

  if (loading) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8B3A2A", fontWeight: 600 }}>{t.planning}</div>
      </div>
    );
  }

  if (itineraryDays.length === 0) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8B3A2A", fontWeight: 600 }}>{userLanguage === "Marathi" ? "सहलीचा कार्यक्रम सापडला नाही." : "No itinerary found."}</div>
      </div>
    );
  }

  const day = itineraryDays[activeDay];

  return (
    <div style={{ background: "#FBF8F3", height: "100%", overflowY: "auto", paddingBottom: 80 }}>
      <StatusBar light />

      {/* Hero / Header */}
      <div
        style={{
          background: "#8B3A2A",
          padding: "20px 20px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
              {t.myPlan}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>
              {itineraryDays.length} {t.stops} · Pune, MH
            </div>
          </div>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: t.myPlan,
                  text: "Check out my Pune travel plan!",
                  url: window.location.href,
                }).catch(console.error);
              } else {
                alert("Sharing is not supported on this browser.");
              }
            }}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: 10,
              padding: "6px 10px",
              fontSize: 11,
              color: "#fff",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t.share} ↗
          </button>
        </div>
      </div>

      {/* Day selector */}
      <div style={{ background: "#8B3A2A", padding: "0 16px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
        {itineraryDays.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveDay(i)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              border: "none",
              cursor: "pointer",
              background: activeDay === i ? "#fff" : "rgba(255,255,255,0.2)",
              color: activeDay === i ? "#8B3A2A" : "rgba(255,255,255,0.85)",
            }}
          >
            {d.label}
          </button>
        ))}
          <button
            onClick={() => alert("Itinerary Overview: Map and highlights coming soon!")}
            style={{
              padding: "5px 14px",
              borderRadius: 16,
              fontSize: 11,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              background: "rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {t.overview}
          </button>
      </div>

      {/* Timeline */}
      <div style={{ padding: "24px 20px", background: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20, position: "relative", zIndex: 5 }}>
        {day.stops.map((stop, i) => (
          <div key={stop.id} style={{ display: "flex", gap: 16, marginBottom: 24, position: "relative" }}>
            {/* Time */}
            <div style={{ width: 45, fontSize: 11, fontWeight: 700, color: "#8B3A2A", paddingTop: 2 }}>
              {stop.time}
            </div>

            {/* Dot & Line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: stop.dotColor, zIndex: 2 }} />
              {i !== day.stops.length - 1 && (
                <div style={{ width: 1.5, flex: 1, background: "#EDE8DF", margin: "4px 0" }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1C1412" }}>{stop.name}</div>
              <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 4, lineHeight: 1.5 }}>
                {stop.desc}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {Array.isArray(stop.tags) && stop.tags.map((tag, idx) => {
                  const style = tagStyles[tag.type] || tagStyles.neutral;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 8,
                        fontSize: 10,
                        fontWeight: 600,
                        background: style.bg,
                        color: style.color,
                      }}
                    >
                      {tag.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add stop button */}
      <div style={{ padding: "16px 16px 8px", background: "#fff" }}>
        <button
          onClick={() => alert("Directly add stops coming soon! For now, find a place in 'Explore' and click 'Add to Itinerary'.")}
          style={{
            width: "100%",
            background: "#FBF8F3",
            color: "#8B3A2A",
            border: "1.5px dashed #C46348",
            borderRadius: 14,
            padding: "12px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          + {t.addStop}
        </button>
      </div>
    </div>
  );
}
