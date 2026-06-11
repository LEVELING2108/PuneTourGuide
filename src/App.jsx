import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import ExploreScreen from "./screens/ExploreScreen";
import MapScreen from "./screens/MapScreen";
import PlanScreen from "./screens/PlanScreen";
import PlaceDetailScreen from "./screens/PlaceDetailScreen";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setActiveTab("detail");
  };

  const handleBack = () => {
    setSelectedPlace(null);
    setActiveTab("explore");
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onPlaceSelect={handlePlaceSelect} />;
      case "explore":
        return <ExploreScreen onPlaceSelect={handlePlaceSelect} />;
      case "map":
        return <MapScreen />;
      case "plan":
        return <PlanScreen />;
      case "detail":
        return <PlaceDetailScreen place={selectedPlace} onBack={handleBack} />;
      default:
        return <HomeScreen onPlaceSelect={handlePlaceSelect} />;
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
        <div className="flex-1 overflow-y-auto pb-20">
          {renderScreen()}
        </div>

        {/* Bottom nav — hidden on detail screen */}
        {activeTab !== "detail" && (
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>
    </div>
  );
}
