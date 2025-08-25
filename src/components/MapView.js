import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapView = () => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return; // Prevent re-initializing

    // Initialize map
    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 12,
    });

    // Add red marker
    new maplibregl.Marker({ color: "red" })
      .setLngLat([-122.4194, 37.7749])
      .addTo(mapInstance.current);

    // Force ultra-dark background after style loads
    mapInstance.current.on("style.load", () => {
      if (mapInstance.current.getLayer("background")) {
        mapInstance.current.setPaintProperty(
          "background",
          "background-color",
          "#000000"
        );
      }
    });
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-screen"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default MapView;
