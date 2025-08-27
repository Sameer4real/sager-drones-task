import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDrone, setSelectedDrone } from "../store/actions";

const MapView = ({ setIsMapOpen }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const wsRef = useRef(null);
  const markersRef = useRef({});
  const dispatch = useDispatch();
  const selectedDrone = useSelector((state) => state.selectedDrone);

  const dronePositionsRef = useRef({});

  const [isMapLoading, setIsMapLoading] = useState(true);
  const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:9013";

  // Initialize MapLibre map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [36.2765, 33.5138],
      zoom: 12,
    });

    mapRef.current.on("load", () => setIsMapLoading(false));

    return () => mapRef.current?.remove();
  }, []);

  // Popup content function
  const createPopupContent = ({ Name, altitude }) => `
    <div class="drone-info">
      <h3>${Name || "Unknown Drone"}</h3>
      <div class="drone-info-container">
        <div class="info-row">
          <span class="info-label">Altitude</span>
          <span class="info-value">${
            altitude ? `${altitude}m` : "Unknown"
          }</span>
        </div>
        <div class="info-row">
          <span class="info-label">Flight Time:</span>
          <span class="info-value">00:25:45</span>
        </div>
      </div>
    </div>
  `;

  // Create drone marker element
  const createDroneMarkerElement = (yaw = 0, registration = "") => {
    const containsB = registration.toUpperCase().includes("B");
    const container = document.createElement("div");
    container.style.width = "50px";
    container.style.height = "50px";
    container.style.position = "relative";
    container.style.borderRadius = "50%";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.backgroundColor = containsB
      ? "rgba(36, 255, 0, 1)"
      : "rgba(217, 9, 21, 1)";
    container.style.cursor = "pointer";
    container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";

    const drone = document.createElement("div");
    drone.className = "drone-icon";
    drone.style.width = "25px";
    drone.style.height = "25px";
    drone.style.backgroundImage = `url("/drone.png")`;
    drone.style.backgroundSize = "contain";
    drone.style.backgroundRepeat = "no-repeat";
    drone.style.backgroundPosition = "center";
    drone.style.transition = "transform 0.2s linear";
    drone.style.transform = `rotate(${yaw}deg)`;
    container.appendChild(drone);

    const indicator = document.createElement("div");
    indicator.className = "directional-arrow";
    indicator.style.width = "16px";
    indicator.style.height = "16px";
    indicator.style.backgroundColor = containsB
      ? "rgba(36, 255, 0, 1)"
      : "rgba(217, 9, 21, 1)";
    indicator.style.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
    indicator.style.position = "absolute";
    indicator.style.left = "50%";
    indicator.style.top = "50%";
    const radius = 25;
    const gap = 5;
    const offset = radius + gap;
    indicator.style.transformOrigin = "50% 50%";
    indicator.style.transform = `rotate(${yaw}deg) translateY(-${offset}px)`;
    indicator.style.transition =
      "transform 0.2s linear, background-color 0.2s linear";
    container.appendChild(indicator);

    return container;
  };

  // Update or create markers
  const updateMarkers = useCallback(
    (features) => {
      if (!mapRef.current) return;

      features.forEach((feature) => {
        if (feature.geometry?.type !== "Point") return;
        const [lng, lat] = feature.geometry.coordinates;
        const { serial, yaw = 0, registration = "" } = feature.properties;
        const id = serial;
        dronePositionsRef.current[id] = [lng, lat];

        if (markersRef.current[id]) {
          const marker = markersRef.current[id];
          marker.setLngLat([lng, lat]);
          const container = marker.getElement();
          const drone = container.querySelector(".drone-icon");
          const arrow = container.querySelector(".directional-arrow");
          if (drone) drone.style.transform = `rotate(${yaw}deg)`;
          if (arrow)
            arrow.style.transform = `translate(${
              25 + 5 + 10
            }px, 0) rotate(${yaw}deg)`;
        } else {
          const el = createDroneMarkerElement(yaw, registration);

          // Click on marker → highlight drone
          el.addEventListener("click", () => {
            dispatch(setSelectedDrone(serial));
            setIsMapOpen(true);
          });

          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
          }).setHTML(createPopupContent(feature.properties));

          el.addEventListener("mouseenter", () =>
            popup.addTo(mapRef.current).setLngLat([lng, lat])
          );
          el.addEventListener("mouseleave", () => popup.remove());

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          markersRef.current[id] = marker;
        }
      });
    },
    [dispatch, setIsMapOpen]
  );

  // WebSocket
  const connectWebSocket = useCallback(() => {
    wsRef.current = new WebSocket(WS_URL);
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
        updateMarkers(data.features);
        data.features.forEach((f) => dispatch(addDrone(f)));
      }
    };
  }, [dispatch, updateMarkers]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.once("load", connectWebSocket);
    }
  }, [connectWebSocket]);

  // Fly to selected drone when changed from sidebar
  useEffect(() => {
    if (
      selectedDrone &&
      dronePositionsRef.current[selectedDrone] &&
      mapRef.current
    ) {
      const [lng, lat] = dronePositionsRef.current[selectedDrone];
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
    }
  }, [selectedDrone]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      {isMapLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            Loading map...
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
