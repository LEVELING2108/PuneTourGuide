import { tagColorMap } from "../data/tokens";
import { calculateDistance, formatDistance } from "../utils/location";

export default function PlaceCard({ place, onClick, userLocation }) {
  const tagStyle = tagColorMap[place.tagColor] || tagColorMap.terracotta;

  const dynamicDistance = userLocation
    ? calculateDistance(userLocation.latitude, userLocation.longitude, place.latitude, place.longitude)
    : null;

  return (
    <div
      onClick={() => onClick(place)}
      style={{
        width: 150,
        flexShrink: 0,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #EDE8DF",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "100%",
          height: 90,
          background: place.bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
        }}
      >
        {place.emoji}
      </div>

      {/* Info */}
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1412" }}>{place.name}</div>
        <div style={{ fontSize: 11, color: "#6B5B52", marginTop: 2 }}>
          ⭐ {place.rating?.toFixed(1) || "4.0"} · {formatDistance(dynamicDistance)}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 5,
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 10,
            background: tagStyle.bg,
            color: tagStyle.color,
          }}
        >
          {place.tag}
        </div>
      </div>
    </div>
  );
}
