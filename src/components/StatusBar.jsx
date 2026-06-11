export default function StatusBar({ light = false }) {
  const textColor = light ? "#fff" : "#1C1412";
  const bg = light ? "#8B3A2A" : "#FBF8F3";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 20px 4px",
        background: bg,
        fontSize: 11,
        fontWeight: 500,
        color: textColor,
      }}
    >
      <span>9:41</span>
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span>▶</span>
        <span>WiFi</span>
        <span>🔋</span>
      </span>
    </div>
  );
}
