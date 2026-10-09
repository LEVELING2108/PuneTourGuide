import { translations } from "../data/translations";

export default function BottomNav({ activeTab, onTabChange, userLanguage }) {
  const t = translations[userLanguage] || translations.English;
  const tabs = [
    { id: "home", icon: "🏠", label: t.home },
    { id: "explore", icon: "🧭", label: t.explore },
    { id: "map", icon: "🗺️", label: t.map },
    { id: "plan", icon: "📅", label: t.plan },
    { id: "profile", icon: "👤", label: t.profile },
  ];
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex justify-around items-center bg-white border-t"
      style={{ borderColor: "#EDE8DF", paddingTop: 10, paddingBottom: 16, zIndex: 50 }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-0.5"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#8B3A2A" : "#6B5B52",
              minWidth: 48,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
