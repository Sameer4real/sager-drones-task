import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  addDrone,
  SET_SELECTED_DRONE,
  setSelectedDrone,
} from "../store/actions";
import "./MapView.css";

const MapView = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const dispatch = useDispatch();
  const wsRef = useRef(null);

  // State management
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Keep track of markers and clusters
  const markersRef = useRef({});
  const clusterRef = useRef(null);

  // WebSocket connection configuration
  const WS_URL = "ws://localhost:9013";
  const RECONNECT_DELAY = 3000;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_ATTEMPTS_REF = useRef(0);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize the map with enhanced configuration
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [36.2765, 33.5138], // Damascus
      zoom: 12,
      maxZoom: 18,
      minZoom: 3,
      bearing: 0,
      antialias: true,
      preserveDrawingBuffer: true,
    });

    // Add navigation controls
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add fullscreen control
    mapRef.current.addControl(new maplibregl.FullscreenControl(), "top-right");

    // Add geolocate control
    mapRef.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right"
    );

    // Simple marker management without clustering for now
    clusterRef.current = {
      markers: new Set(),
      addLayer: (marker) => {
        clusterRef.current.markers.add(marker);
        marker.addTo(mapRef.current);
      },
      removeLayer: (marker) => {},
    };

    // Map event listeners
    mapRef.current.on("load", () => {
      setError(null);
      setIsMapLoading(false);
    });

    mapRef.current.on("error", (e) => {
      console.error("Map error:", e);
      setError("Failed to load map");
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus("connecting");
      setError(null);

      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        setConnectionStatus("connected");
        setError(null);
        RECONNECT_ATTEMPTS_REF.current = 0; // Reset reconnection attempts on successful connection
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastUpdate(new Date());

          if (
            data.type === "FeatureCollection" &&
            Array.isArray(data.features)
          ) {
            updateMarkers(data.features);
            data.features.forEach((f) => {
              dispatch(addDrone(f)); // ✅ just add, don’t overwrite
            });
          }
        } catch (err) {
          console.error("Error parsing WebSocket data:", err);
          setError("Invalid data received from server");
        }
      };

      wsRef.current.onclose = (event) => {
        setConnectionStatus("disconnected");

        // Attempt to reconnect if not a normal closure and under max attempts
        if (
          event.code !== 1000 &&
          RECONNECT_ATTEMPTS_REF.current < MAX_RECONNECT_ATTEMPTS
        ) {
          RECONNECT_ATTEMPTS_REF.current++;
          setTimeout(() => {
            if (connectionStatus !== "connected") {
              connectWebSocket();
            }
          }, RECONNECT_DELAY * RECONNECT_ATTEMPTS_REF.current);
        } else if (RECONNECT_ATTEMPTS_REF.current >= MAX_RECONNECT_ATTEMPTS) {
          setError(
            "Max reconnection attempts reached. Please refresh the page."
          );
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
        setError("Connection failed");
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setConnectionStatus("error");
      setError("Failed to establish connection");
    }
  }, [connectionStatus]);

  // Update markers with enhanced functionality
  const updateMarkers = useCallback((features) => {
    if (!mapRef.current) return;

    const activeDrones = new Set();

    // Batch marker updates for better performance
    const updates = [];

    features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const {
        serial,
        Name,
        pilot,
        organization,
        altitude,
        speed,
        heading,
        yaw,
      } = feature.properties;
      const id = serial;

      activeDrones.add(id);

      // If marker exists → update position and data
      if (markersRef.current[id]) {
        updates.push(() => {
          const marker = markersRef.current[id];
          marker.setLngLat([lng, lat]);

          // Update the custom marker rotation based on yaw
          const markerElement = marker.getElement();
          if (markerElement && yaw !== undefined) {
            markerElement.style.transform = `rotate(${yaw}deg)`;
          }

          // Update popup content with latest data
          const popup = marker.getPopup();
          popup.setHTML(
            createPopupContent({
              Name,
              pilot,
              organization,
              altitude,
              speed,
              heading,
              yaw,
              serial,
            })
          );
        });
      } else {
        // Create new custom drone marker
        const el = document.createElement("div");
        el.className = "drone-marker-container";
        el.style.width = "32px";
        el.style.height = "32px";
        el.style.backgroundColor = "#66FF00";
        el.style.borderRadius = "50%";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.boxShadow = "0 2px 8px rgba(102, 255, 0, 0.3)";
        el.style.cursor = "pointer";
        el.style.transform = `rotate(${yaw || 0}deg)`;
        el.style.transition = "transform 0.3s ease";

        // Add a simple text indicator for now
        el.innerHTML = "🛸";
        el.style.fontSize = "20px";
        el.style.color = "white";

        const marker = new maplibregl.Marker(el).setLngLat([lng, lat]).setPopup(
          new maplibregl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: "300px",
            className: "drone-popup",
          }).setHTML(
            createPopupContent({
              Name,
              pilot,
              organization,
              altitude,
              speed,
              heading,
              yaw,
              serial,
            })
          )
        );

        // Add to cluster group
        clusterRef.current.addLayer(marker);
        markersRef.current[id] = marker;
      }
    });

    // Execute all updates in a batch for better performance
    requestAnimationFrame(() => {
      updates.forEach((update) => {
        update();
      });
    });
  }, []);

  // Create enhanced popup content
  const createPopupContent = ({
    Name,
    pilot,
    organization,
    altitude,
    speed,
    heading,
    yaw,
    serial,
  }) => {
    // dispatch(setSelectedDrone(serial));

    return `
      <div class="drone-info">
        <h3>${Name || "Unknown Drone"}</h3>
        <div class="info-row">
          <span class="info-label">Pilot:</span>
          <span class="info-value">${pilot || "Unknown"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Organization:</span>
          <span class="info-value">${organization || "Unknown"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Altitude:</span>
          <span class="info-value">${
            altitude ? `${altitude}m` : "Unknown"
          }</span>
        </div>
        ${
          speed
            ? `
        <div class="info-row">
          <span class="info-label">Speed:</span>
          <span class="info-value">${speed}m/s</span>
        </div>
        `
            : ""
        }
                 ${
                   heading
                     ? `
          <div class="info-row">
            <span class="info-label">Heading:</span>
            <span class="info-value">${heading}°</span>
          </div>
         `
                     : ""
                 }
         ${
           yaw !== undefined
             ? `
          <div class="info-row">
            <span class="info-label">Yaw:</span>
            <span class="info-value">${yaw}°</span>
          </div>
         `
             : ""
         }
        <div class="last-updated">
          Last updated: ${new Date().toLocaleTimeString()}
        </div>
      </div>
    `;
  };

  // Connect WebSocket when map is ready
  useEffect(() => {
    if (mapRef.current && mapRef.current.loaded()) {
      connectWebSocket();
    } else if (mapRef.current) {
      mapRef.current.once("load", connectWebSocket);
    }
  }, [connectWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="map-container">
      {/* Error Display */}
      {error && <div className="error-display">⚠️ {error}</div>}

      {/* Map Container */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Loading Overlay */}
      {isMapLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "10px" }}>🗺️</div>
            <div>Loading map...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
