import { tagColorMap } from "../data/tokens";
import { calculateDistance, formatDistance } from "../utils/location";
import { translations } from "../data/translations";

export default function PlaceCard({ place, onClick, userLocation, userLanguage }) {
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
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1412" }}>
          {(userLanguage === "Marathi" || userLanguage === "Hindi") && place.name_mr ? place.name_mr : place.name}
        </div>
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
          {userLanguage === "Marathi" && place.tag === "Must Visit" ? "भेट दिलीच पाहिजे" : 
           userLanguage === "Marathi" && place.tag === "Iconic" ? "प्रसिद्ध" :
           userLanguage === "Marathi" && place.tag === "Family" ? "कौटुंबिक" :
           userLanguage === "Marathi" && place.tag === "New Discovery" ? "नवीन शोध" :
           userLanguage === "Hindi" && place.tag === "Must Visit" ? "जरूर जाएं" :
           userLanguage === "Hindi" && place.tag === "Iconic" ? "प्रसिद्ध" :
           userLanguage === "Hindi" && place.tag === "Family" ? "पारिवारिक" :
           userLanguage === "Hindi" && place.tag === "New Discovery" ? "नई खोज" :
           userLanguage === "Gujarati" && place.tag === "Must Visit" ? "મુલાકાત લેવા જેવું" :
           userLanguage === "Gujarati" && place.tag === "Iconic" ? "પ્રસિદ્ધ" :
           userLanguage === "Gujarati" && place.tag === "Family" ? "કૌટુંબિક" :
           userLanguage === "Gujarati" && place.tag === "New Discovery" ? "નવી શોધ" :
           place.tag}
        </div>
      </div>
    </div>
  );
}
