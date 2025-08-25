import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

import { useDispatch, useSelector } from "react-redux";
import { addDrone } from "../store/actions";

const MapView = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const dispatch = useDispatch();
  const drones = useSelector((state) => state.features);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [36.448056861660255, 33.654349566168214],
      zoom: 12,
    });

    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const ws = new WebSocket("ws://localhost:9013");

    ws.onopen = () => console.log("✅ WebSocket connected");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data, "dataa");
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (
              data.type === "FeatureCollection" &&
              Array.isArray(data.features)
            ) {
              data.features.forEach((f) => {
                dispatch(addDrone(f)); // ✅ just add, don’t overwrite
              });
            }
          } catch (err) {
            console.error("❌ Error parsing WebSocket data:", err);
          }
        };

        if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
          data.features.forEach((feature) => {
            if (feature.geometry?.type === "Point") {
              const [lng, lat] = feature.geometry.coordinates;
              const { serial, Name } = feature.properties;
              const id = serial || `${lng}-${lat}`;

              if (markersRef.current[id]) {
                markersRef.current[id].setLngLat([lng, lat]);
              } else {
                // 🔥 Minimal visible marker (bright red square)
                const el = document.createElement("div");
                el.className = "drone-marker";
                el.style.width = "32px";
                el.style.height = "32px";
                el.style.backgroundImage = "url('/drone.png')";
                el.style.backgroundSize = "contain";
                el.style.backgroundRepeat = "no-repeat";
                el.style.backgroundPosition = "center";
                el.style.cursor = "pointer";

                const marker = new maplibregl.Marker({ element: el })
                  .setLngLat([lng, lat])
                  .addTo(mapRef.current);

                markersRef.current[id] = marker;
              }
            }
          });
        }
      } catch (err) {
        console.error("❌ Error parsing WebSocket data:", err);
      }
    };

    ws.onclose = () => console.log("❌ WebSocket closed");
    return () => ws.close();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default MapView;
