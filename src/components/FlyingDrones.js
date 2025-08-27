import React, { useMemo } from "react";
import { useSelector } from "react-redux";

const FlyingDrones = () => {
  // Get drones from Redux store
  const drones = useSelector((state) => state.features || []);

  // Count drones whose registration contains "B" (case-insensitive)
  const flyingCount = useMemo(() => {
    return drones.filter((drone) =>
      drone.properties?.registration?.toUpperCase().includes("B")
    ).length;
  }, [drones]);

  return (
    <div className="flyingDrones">
      <div className="flyingDrones-counter">
        <span>{flyingCount}</span>
      </div>
      <p>Flying Drones</p>
    </div>
  );
};

export default FlyingDrones;
