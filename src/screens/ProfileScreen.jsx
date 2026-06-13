import { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import PlaceListItem from "../components/PlaceListItem";
import { fetchPlaces, fetchUserStats } from "../data/api";
import { colors } from "../data/tokens";

export default function ProfileScreen({ onPlaceSelect }) {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [stats, setStats] = useState({ totalPoints: 0, savedCount: 0, completedStops: 0, discoveredCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveTab] = useState("bookmarks"); // 'bookmarks' or 'activity'

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [placesData, statsData] = await Promise.all([
          fetchPlaces({ isSaved: true }),
          fetchUserStats()
        ]);
        setSavedPlaces(placesData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const getPunekarLevel = (pts) => {
    if (pts >= 1000) return { title: "PUNERI LEGEND", icon: "👑" };
    if (pts >= 500) return { title: "SHILEDAR", icon: "🚩" };
    if (pts >= 101) return { title: "PUNE EXPLORER", icon: "🧭" };
    return { title: "NAVIN PUNEKAR", icon: "🌱" };
  };

  const currentLevel = getPunekarLevel(stats.totalPoints);

  if (loading) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: colors.wadaRed, fontWeight: 600 }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FBF8F3", minHeight: "100%", fontFamily: 'Mukta' }}>
      <StatusBar light />

      {/* Profile Header */}
      <div
        style={{
          background: colors.wadaRed,
          padding: "32px 16px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative elements */}
        <div style={{ 
          position: "absolute", top: -20, left: -20, width: 100, height: 100, 
          borderRadius: "50%", background: "rgba(255,255,255,0.05)" 
        }} />
        <div style={{ 
          position: "absolute", bottom: -30, right: -10, width: 150, height: 150, 
          borderRadius: "50%", background: "rgba(255,255,255,0.03)" 
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "#fff",
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              border: `4px solid ${colors.paithaniGold}`,
              boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
            }}
          >
            👤
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Sourav Paul</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
            Local Guide · Pune Explorer
          </div>
          
          {/* Punekar Level Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            background: colors.paithaniSaffron,
            padding: "6px 14px",
            borderRadius: 20,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <span style={{ fontSize: 14 }}>{currentLevel.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>
              PUNEKAR LEVEL: {currentLevel.title}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        margin: "-24px 16px 20px", 
        background: "#fff", 
        borderRadius: 16, 
        padding: "16px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12,
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        position: "relative",
        zIndex: 2
      }}>
        {[
          { label: "Saved", val: stats.savedCount, color: colors.wadaRed },
          { label: "Points", val: stats.totalPoints, color: colors.paithaniSaffron },
          { label: "Stops", val: stats.completedStops, color: colors.peshwaPurple },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.val}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: colors.inkMuted, textTransform: "uppercase" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 24, padding: "0 20px", borderBottom: `1px solid ${colors.stoneDark}` }}>
        <button 
          onClick={() => setActiveTab("bookmarks")}
          style={{ 
            padding: "12px 4px", fontSize: 14, fontWeight: 700, border: "none", background: "none", cursor: "pointer",
            color: activeSubTab === "bookmarks" ? colors.wadaRed : colors.inkMuted,
            borderBottom: activeSubTab === "bookmarks" ? `3px solid ${colors.wadaRed}` : "3px solid transparent",
            transition: "0.2s"
          }}
        >
          Saved Places
        </button>
        <button 
          onClick={() => setActiveTab("activity")}
          style={{ 
            padding: "12px 4px", fontSize: 14, fontWeight: 700, border: "none", background: "none", cursor: "pointer",
            color: activeSubTab === "activity" ? colors.wadaRed : colors.inkMuted,
            borderBottom: activeSubTab === "activity" ? `3px solid ${colors.wadaRed}` : "3px solid transparent",
            transition: "0.2s"
          }}
        >
          Badges & Achievements
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ background: "#fff", flex: 1 }}>
        {activeSubTab === "bookmarks" ? (
          <div>
            {savedPlaces.length === 0 ? (
              <div style={{ padding: "48px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.ink }}>Your treasure is empty</div>
                <div style={{ fontSize: 13, color: colors.inkMuted, marginTop: 6, padding: "0 40px" }}>
                  Save your favorite spots across Pune to see them listed here.
                </div>
              </div>
            ) : (
              savedPlaces.map((place) => (
                <PlaceListItem key={place.id} place={place} onClick={onPlaceSelect} />
              ))
            )}
          </div>
        ) : (
          <div style={{ padding: "20px 16px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.ink, marginBottom: 16 }}>Earned Badges</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: "🏰", name: "History Buff", active: stats.totalPoints > 200 },
                { icon: "🍽️", name: "Foodie", active: stats.totalPoints > 400 },
                { icon: "⛩️", name: "Devotee", active: stats.totalPoints > 100 },
                { icon: "🥾", name: "Trekker", active: stats.totalPoints > 800 },
              ].map(badge => (
                <div key={badge.name} style={{ 
                  background: badge.active ? colors.stone : "#f9f9f9", 
                  borderRadius: 12, padding: "12px", border: `1px solid ${badge.active ? colors.stoneDark : "#eee"}`,
                  display: "flex", alignItems: "center", gap: 10,
                  opacity: badge.active ? 1 : 0.4
                }}>
                  <div style={{ fontSize: 24, filter: badge.active ? "none" : "grayscale(1)" }}>{badge.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: colors.ink }}>{badge.name}</div>
                    <div style={{ fontSize: 10, color: colors.inkMuted }}>{badge.active ? "Unlocked" : "Locked"}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              marginTop: 24, padding: "16px", borderRadius: 12, background: colors.wadaRedLight,
              border: `1px dashed ${colors.wadaRed}`
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.wadaRed }}>Points Breakdown</div>
              <div style={{ fontSize: 11, color: colors.inkMuted, marginTop: 6 }}>
                • {stats.savedCount} Places Saved (+{stats.savedCount * 10} pts)<br/>
                • {stats.completedStops} Stops Completed (+{stats.completedStops * 50} pts)<br/>
                • {stats.discoveredCount} New Discoveries (+{stats.discoveredCount * 100} pts)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{ padding: "24px 16px 40px", textAlign: "center" }}>
        <button style={{ 
          background: "none", border: `1px solid ${colors.stoneDark}`, borderRadius: 10,
          padding: "8px 20px", fontSize: 12, fontWeight: 600, color: colors.inkMuted, cursor: "pointer"
        }}>
          Edit Profile
        </button>
        <div style={{ fontSize: 10, color: colors.inkMuted, marginTop: 12 }}>
          Member since June 2026 · Aamhi Pune Tour
        </div>
      </div>
    </div>
  );
}
