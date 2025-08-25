import React, { useState } from "react";
import MapView from "./components/MapView";
import Header from "./components/Header";
import "./styles/main.scss";
import Sidebar from "./components/Sidebar";
import DronesMenu from "./components/DronesMenu";
import { AnimatePresence } from "framer-motion";

function App() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <div className="main">
      <Header />

      <div className="main_container">
        <Sidebar isMapOpen={isMapOpen} setIsMapOpen={setIsMapOpen} />
        <MapView />
        {/* Animated Drawer */}
        <AnimatePresence>
          {isMapOpen && <DronesMenu onClose={() => setIsMapOpen(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
