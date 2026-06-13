import { useState, useEffect } from "react";
import StatusBar from "../components/StatusBar";
import PlaceListItem from "../components/PlaceListItem";
import { fetchPlaces, fetchUserStats } from "../data/api";
import { colors } from "../data/tokens";

export default function ProfileScreen({ onPlaceSelect }) {
  // User Personalization State
  const [userName, setUserName] = useState(() => localStorage.getItem("pune_user_name") || "Sourav Paul");
  const [userBio, setUserBio] = useState(() => localStorage.getItem("pune_user_bio") || "Local Guide · Pune Explorer");
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem("pune_user_avatar") || null);
  
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [discoveredPlaces, setDiscoveredPlaces] = useState([]);
  const [stats, setStats] = useState({ totalPoints: 0, savedCount: 0, completedStops: 0, discoveredCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveTab] = useState("bookmarks"); // 'bookmarks', 'discoveries', 'activity'
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempBio, setTempBio] = useState(userBio);
  const [tempAvatar, setTempAvatar] = useState(userAvatar);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [savedData, discoveredData, statsData] = await Promise.all([
          fetchPlaces({ isSaved: true }),
          fetchPlaces({ isDiscovered: true }),
          fetchUserStats()
        ]);
        setSavedPlaces(savedData);
        setDiscoveredPlaces(discoveredData);
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
    if (pts >= 1000) return { title: "PUNERI LEGEND", icon: "👑", rank: 5 };
    if (pts >= 500) return { title: "SHILEDAR", icon: "🚩", rank: 42 };
    if (pts >= 101) return { title: "PUNE EXPLORER", icon: "🧭", rank: 156 };
    return { title: "NAVIN PUNEKAR", icon: "🌱", rank: 890 };
  };

  const currentLevel = getPunekarLevel(stats.totalPoints);

  const handleSaveProfile = () => {
    setUserName(tempName);
    setUserBio(tempBio);
    setUserAvatar(tempAvatar);
    localStorage.setItem("pune_user_name", tempName);
    localStorage.setItem("pune_user_bio", tempBio);
    if (tempAvatar) {
      localStorage.setItem("pune_user_avatar", tempAvatar);
    } else {
      localStorage.removeItem("pune_user_avatar");
    }
    setIsEditModalOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#FBF8F3", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: colors.wadaRed, fontWeight: 600 }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FBF8F3", minHeight: "100%", fontFamily: 'Mukta', position: "relative" }}>
      <StatusBar light />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{ background: "#fff", width: "100%", borderRadius: 20, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.ink, marginBottom: 20 }}>Edit Profile</div>
            
            {/* Avatar Edit Section */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
              <label style={{ position: "relative", cursor: "pointer" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    border: `3px solid ${colors.paithaniGold}`,
                    overflow: "hidden",
                    backgroundImage: tempAvatar ? `url(${tempAvatar})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!tempAvatar && "👤"}
                </div>
                <div style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: "50%",
                  background: colors.wadaRed, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, border: "2px solid #fff"
                }}>
                  📷
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
              <div style={{ fontSize: 11, color: colors.inkMuted, marginTop: 8 }}>Click to change photo</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.inkMuted, marginBottom: 6 }}>Display Name</div>
              <input 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{ 
                  width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${colors.stoneDark}`,
                  fontSize: 14, outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.inkMuted, marginBottom: 6 }}>Bio / Tagline</div>
              <input 
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                style={{ 
                  width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${colors.stoneDark}`,
                  fontSize: 14, outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${colors.stoneDark}`, background: "none", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: colors.wadaRed, color: "#fff", fontWeight: 600, cursor: "pointer" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div
        style={{
          background: colors.wadaRed,
          padding: "32px 16px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
              overflow: "hidden",
              backgroundImage: userAvatar ? `url(${userAvatar})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!userAvatar && "👤"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{userName}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
            {userBio}
          </div>
          
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

      {/* Stats & Rank Card */}
      <div style={{ 
        margin: "-24px 16px 20px", 
        background: "#fff", 
        borderRadius: 16, 
        padding: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        position: "relative",
        zIndex: 2
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16, borderBottom: `1px solid ${colors.stone}`, paddingBottom: 16 }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: colors.wadaRedLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏆</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.ink }}>Community Rank</div>
              <div style={{ fontSize: 10, color: colors.inkMuted }}>Based on {stats.totalPoints} points</div>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: colors.wadaRed }}>#{currentLevel.rank} in Pune</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 20, padding: "0 20px", borderBottom: `1px solid ${colors.stoneDark}`, overflowX: "auto" }}>
        {[
          { id: "bookmarks", label: "Saved" },
          { id: "discoveries", label: "My Discoveries" },
          { id: "activity", label: "Badges" },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: "12px 4px", fontSize: 13, fontWeight: 700, border: "none", background: "none", cursor: "pointer",
              color: activeSubTab === tab.id ? colors.wadaRed : colors.inkMuted,
              borderBottom: activeSubTab === tab.id ? `3px solid ${colors.wadaRed}` : "3px solid transparent",
              whiteSpace: "nowrap"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: "#fff", flex: 1 }}>
        {activeSubTab === "bookmarks" && (
          <div>
            {savedPlaces.length === 0 ? (
              <div style={{ padding: "48px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.ink }}>Your treasure is empty</div>
                <div style={{ fontSize: 13, color: colors.inkMuted, marginTop: 6 }}>Save spots to see them here.</div>
              </div>
            ) : (
              savedPlaces.map((place) => (
                <PlaceListItem key={place.id} place={place} onClick={onPlaceSelect} />
              ))
            )}
          </div>
        )}

        {activeSubTab === "discoveries" && (
          <div>
            {discoveredPlaces.length === 0 ? (
              <div style={{ padding: "48px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔎</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.ink }}>No Discoveries Yet</div>
                <div style={{ fontSize: 13, color: colors.inkMuted, marginTop: 6, padding: "0 40px" }}>
                  Search for new places in the Explore tab to contribute to the Pune Guide!
                </div>
              </div>
            ) : (
              <div>
                <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: colors.wadaRed, background: colors.wadaRedLight }}>
                  CONTRIBUTIONS TO PUNE DATABASE
                </div>
                {discoveredPlaces.map((place) => (
                  <PlaceListItem key={place.id} place={place} onClick={onPlaceSelect} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === "activity" && (
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
        <button 
          onClick={() => {
            setTempName(userName);
            setTempBio(userBio);
            setTempAvatar(userAvatar);
            setIsEditModalOpen(true);
          }}
          style={{ 
            background: "none", border: `1px solid ${colors.stoneDark}`, borderRadius: 10,
            padding: "8px 20px", fontSize: 12, fontWeight: 600, color: colors.inkMuted, cursor: "pointer"
          }}
        >
          Edit Profile
        </button>
        <div style={{ fontSize: 10, color: colors.inkMuted, marginTop: 12 }}>
          Member since June 2026 · Aamhi Pune Tour
        </div>
      </div>
    </div>
  );
}
