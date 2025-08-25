import React from "react";

const Drones = ({ registration, serial, pilot, org }) => {
  // Check if registration contains 'b' or 'B'
  const isB = registration.toLowerCase().includes("b");

  return (
    <div className="drones">
      <h2>DJI Mavic 3 Pro</h2>
      <div className="drones-content">
        <div className="drones_info">
          <div className="drones_info-data">
            <h4>Serial #</h4>
            <h3>{serial}</h3>
          </div>
          <div className="drones_info-data">
            <h4>Registration #</h4>
            <h3>{registration}</h3>
          </div>
          <div className="drones_info-data" style={{ marginTop: "10px" }}>
            <h4>Pilot </h4>
            <h3>{pilot}</h3>
          </div>
          <div className="drones_info-data" style={{ marginTop: "10px" }}>
            <h4>Organization </h4>
            <h3>{org}</h3>
          </div>
        </div>

        {/* Conditionally style the span */}
        <span
          className="drones-circle"
          style={{ backgroundColor: isB ? "green" : "#F9000E" }}
        ></span>
      </div>
    </div>
  );
};

export default Drones;
