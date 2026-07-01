import { tagColorMap, categoryColors } from "../data/tokens";
import { calculateDistance, formatDistance } from "../utils/location";

export default function PlaceListItem({ place, onClick, userLocation, userLanguage }) {
  const catStyle = categoryColors[place.category] || categoryColors.default;
  const tagStyle = tagColorMap[place.tagColor] || tagColorMap.terracotta;

  const dynamicDistance = userLocation
    ? calculateDistance(userLocation.latitude, userLocation.longitude, place.latitude, place.longitude)
    : null;

  return (
    <div
      onClick={() => onClick(place)}
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid #EDE8DF",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          flexShrink: 0,
          background: place.bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        {place.emoji}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1412" }}>
          {(userLanguage === "Marathi" || userLanguage === "Hindi") && place.name_mr ? place.name_mr : place.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#6B5B52",
            marginTop: 2,
            lineHeight: 1.4,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {(userLanguage === "Marathi" || userLanguage === "Hindi") && place.description_mr ? place.description_mr : place.description}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, color: "#B87318" }}>
            ⭐ {place.rating?.toFixed(1) || "4.0"}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#6B5B52",
              padding: "2px 7px",
              background: "#EDE8DF",
              borderRadius: 8,
            }}
          >
            {formatDistance(dynamicDistance)}
          </div>
          {(place.tag === "Open Now" || 
            (userLanguage === "Marathi" && place.tag === "उघडले आहे") || 
            (userLanguage === "Hindi" && place.tag === "खुला है") || 
            (userLanguage === "Gujarati" && place.tag === "ખુલ્લું છે")) && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 7px",
                background: tagStyle.bg,
                color: tagStyle.color,
                borderRadius: 8,
              }}
            >
              {userLanguage === "Marathi" ? "उघडले आहे" :
               userLanguage === "Hindi" ? "खुला है" :
               userLanguage === "Gujarati" ? "ખુલ્લું છે" :
               "Open now"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
