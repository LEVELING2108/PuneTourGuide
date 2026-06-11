import StatusBar from "../components/StatusBar";

export default function PlaceDetailScreen({ place, onBack }) {
  if (!place) return null;

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
          🤍
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
              📍 {place.address} · {place.distance} away
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
            {place.rating} ⭐
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
        {place.phone !== "—" && <InfoRow icon="📞" text={place.phone} />}
        {place.accessible && <InfoRow icon="♿" text="Wheelchair accessible" />}
        {place.guidedTours && <InfoRow icon="🎙️" text="Guided tours available" />}

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {[
            { icon: "🗺️", label: "Directions", color: "#8B3A2A" },
            { icon: "📤", label: "Share", color: "#3D3680" },
            { icon: "🔖", label: "Save", color: "#B87318" },
          ].map((action) => (
            <div
              key={action.label}
              style={{
                flex: 1,
                background: "#FBF8F3",
                borderRadius: 12,
                padding: 10,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 20 }}>{action.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#1C1412", marginTop: 3 }}>
                {action.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
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
