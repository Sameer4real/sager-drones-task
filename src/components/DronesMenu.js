import React from "react";
import { IoCloseCircle } from "react-icons/io5";
import { motion } from "framer-motion";
import Drones from "./Drones";

import { useSelector } from "react-redux";

const DronesMenu = ({ onClose }) => {
  const drones = useSelector((state) => state.features);
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

      {drones.map((drone, index) => {
        const { pilot, organization, serial, registration } = drone.properties;
        //   const [lng, lat] = drone.geometry.coordinates;

        return (
          <>
            <Drones
              key={index}
              serial={serial}
              pilot={pilot}
              org={organization}
              registration={registration}
            />
            <span className="dronesContainer-seperator"></span>
          </>
        );
      })}
    </motion.div>
  );
};

export default DronesMenu;
