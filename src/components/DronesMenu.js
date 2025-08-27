import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedDrone } from "../store/actions";
import { IoCloseCircle } from "react-icons/io5";
import { motion } from "framer-motion";
import Drones from "./Drones";

const DronesMenu = ({ onClose }) => {
  const selectedDrone = useSelector((state) => state.selectedDrone);
  const dispatch = useDispatch();
  const listRefs = useRef({}); // refs for scrolling
  const drones = useSelector((state) => state.features);
  const droneRefs = useRef({});

  useEffect(() => {
    if (selectedDrone && listRefs.current[selectedDrone]) {
      listRefs.current[selectedDrone].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedDrone]);

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
        const { pilot, organization, serial, registration, Name } =
          drone.properties;

        return (
          <React.Fragment key={serial}>
            <div
              ref={(el) => (droneRefs.current[serial] = el)}
              className={`drone-wrapper ${
                selectedDrone === serial ? "selectedDrone" : ""
              }`}
              onClick={() => dispatch(setSelectedDrone(serial))}
            >
              <Drones
                serial={serial}
                pilot={pilot}
                org={organization}
                registration={registration}
                name={Name}
              />
            </div>
            <span className="dronesContainer-seperator"></span>
          </React.Fragment>
        );
      })}
    </motion.div>
  );
};

export default DronesMenu;
