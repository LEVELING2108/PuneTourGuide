import { useState, useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import ExploreScreen from "./screens/ExploreScreen";
import MapScreen from "./screens/MapScreen";
import PlanScreen from "./screens/PlanScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PlaceDetailScreen from "./screens/PlaceDetailScreen";
import AuthScreen from "./screens/AuthScreen";
import BottomNav from "./components/BottomNav";
import { useUserLocation } from "./hooks/useUserLocation";
import { logoutUser } from "./data/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [exploreParams, setExploreParams] = useState({});
  const { location: userLocation } = useUserLocation();
  const [userLanguage, setUserLanguage] = useState(() => localStorage.getItem("pune_user_lang") || "English");
  
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("pune_auth_token");
    const name = localStorage.getItem("pune_user_name");
    return token ? { name } : null;
  });

  useEffect(() => {
    localStorage.setItem("pune_user_lang", userLanguage);
  }, [userLanguage]);

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setActiveTab("detail");
  };

  const handleBack = () => {
    setSelectedPlace(null);
    setActiveTab("explore");
  };

  const handleSearchClick = (params = {}) => {
    setExploreParams(params);
    setActiveTab("explore");
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setActiveTab("home");
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onPlaceSelect={handlePlaceSelect} onSearchClick={handleSearchClick} userLocation={userLocation} userLanguage={userLanguage} />;
      case "explore":
        return <ExploreScreen onPlaceSelect={handlePlaceSelect} initialParams={exploreParams} userLocation={userLocation} userLanguage={userLanguage} />;
      case "map":
        return <MapScreen userLocation={userLocation} userLanguage={userLanguage} />;
      case "plan":
        return <PlanScreen userLocation={userLocation} userLanguage={userLanguage} />;
      case "profile":
        return <ProfileScreen onPlaceSelect={handlePlaceSelect} userLocation={userLocation} userLanguage={userLanguage} setUserLanguage={setUserLanguage} onLogout={handleLogout} />;
      case "detail":
        return <PlaceDetailScreen place={selectedPlace} onBack={handleBack} userLocation={userLocation} userLanguage={userLanguage} />;
      default:
        return <HomeScreen onPlaceSelect={handlePlaceSelect} onSearchClick={handleSearchClick} userLocation={userLocation} userLanguage={userLanguage} />;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-stretch sm:items-start min-h-screen bg-white sm:bg-gray-100 sm:py-8">
        <div
          className="relative bg-[#FBF8F3] overflow-hidden flex flex-col w-full h-[100dvh] sm:h-auto sm:w-[375px] sm:min-h-[812px] sm:rounded-[40px] sm:border-2 sm:border-[#D1CBC0]"
          style={{
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Notch - hidden on mobile device screens */}
          <div
            className="mx-auto z-10 hidden sm:block"
            style={{
              width: 126,
              height: 28,
              background: "#1a1a1a",
              borderRadius: "0 0 18px 18px",
            }}
          />
          <div className="flex-1 relative overflow-hidden">
            <AuthScreen onAuthSuccess={setUser} userLanguage={userLanguage} setUserLanguage={setUserLanguage} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-stretch sm:items-start min-h-screen bg-white sm:bg-gray-100 sm:py-8">
      <div
        className="relative bg-[#FBF8F3] overflow-hidden flex flex-col w-full h-[100dvh] sm:h-auto sm:w-[375px] sm:min-h-[812px] sm:rounded-[40px] sm:border-2 sm:border-[#D1CBC0]"
        style={{
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Notch - hidden on mobile device screens */}
        <div
          className="mx-auto z-10 hidden sm:block"
          style={{
            width: 126,
            height: 28,
            background: "#1a1a1a",
            borderRadius: "0 0 18px 18px",
          }}
        />

        {/* Screen content */}
        <div className="flex-1 relative overflow-hidden">
          {renderScreen()}
        </div>

        {/* Bottom nav — hidden on detail screen */}
        {activeTab !== "detail" && (
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} userLanguage={userLanguage} />
        )}
      </div>
    </div>
  );
}
