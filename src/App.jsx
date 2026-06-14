import { useState, useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import ExploreScreen from "./screens/ExploreScreen";
import MapScreen from "./screens/MapScreen";
import PlanScreen from "./screens/PlanScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PlaceDetailScreen from "./screens/PlaceDetailScreen";
import BottomNav from "./components/BottomNav";
import { useUserLocation } from "./hooks/useUserLocation";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [exploreParams, setExploreParams] = useState({});
  const { location: userLocation } = useUserLocation();
  const [userLanguage, setUserLanguage] = useState(() => localStorage.getItem("pune_user_lang") || "English");

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
        return <ProfileScreen onPlaceSelect={handlePlaceSelect} userLocation={userLocation} userLanguage={userLanguage} setUserLanguage={setUserLanguage} />;
      case "detail":
        return <PlaceDetailScreen place={selectedPlace} onBack={handleBack} userLocation={userLocation} userLanguage={userLanguage} />;
      default:
        return <HomeScreen onPlaceSelect={handlePlaceSelect} onSearchClick={handleSearchClick} userLocation={userLocation} userLanguage={userLanguage} />;
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-8">
      <div
        className="relative bg-[#FBF8F3] overflow-hidden flex flex-col"
        style={{
          width: 375,
          minHeight: 812,
          borderRadius: 40,
          border: "2px solid #D1CBC0",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Notch */}
        <div
          className="mx-auto z-10"
          style={{
            width: 126,
            height: 28,
            background: "#1a1a1a",
            borderRadius: "0 0 18px 18px",
          }}
        />

        {/* Screen content */}
        <div className="flex-1 relative">
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
