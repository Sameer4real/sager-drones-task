import React from "react";
import { GrMap } from "react-icons/gr";
import { AiOutlineDashboard } from "react-icons/ai";

const Sidebar = ({ isMapOpen, setIsMapOpen }) => {
  return (
    <div className="sidebar">
      <div className="sidebar_element">
        <AiOutlineDashboard className="sidebar_icon" />
        <h2>Dashboard</h2>
      </div>
      <span className="sidebar_seperator"></span>
      <button
        className={` ${isMapOpen ? "active" : "sidebar_element"}  `}
        onClick={() => setIsMapOpen(!isMapOpen)}
      >
        <GrMap
          className="sidebar_icon"
          style={isMapOpen ? { color: "white", marginLeft: "-5px" } : ""}
        />
        <h2>Map</h2>
      </button>
    </div>
  );
};

export default Sidebar;
