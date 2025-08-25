import React from "react";
import { IoCloseCircle } from "react-icons/io5";
import { motion } from "framer-motion";
import Drones from "./Drones";

const DronesMenu = ({ onClose }) => {
  return (
    <motion.div
      className="dronesContainer"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="dronesContainer-main">
        <div className="dronesContainer_header">
          <h2>Drone Flying</h2>
          <IoCloseCircle
            className="dronesContainer_header-icon"
            onClick={onClose}
          />
        </div>
        <div className="dronesContainer_info">
          <h3 className="dronesContainer_info-active">Drones</h3>
          <h3>Flight History</h3>
        </div>

        <span className="dronesContainer-seperator"></span>
      </div>

      <Drones />
    </motion.div>
  );
};

export default DronesMenu;
