import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import cities from "./data/cities.json";
import mapbox_access from "./data/mapbox.json";


mapboxgl.accessToken = mapbox_access.token;

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(cities["Los Angeles"].lon);
  const [lat, setLat] = useState(cities["Los Angeles"].lat);
  const [zoom, setZoom] = useState(cities["Los Angeles"].zoom);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/gregvansci/clhfl0xuh00g301q18y353ed5",
        center: [lng, lat],
        zoom: zoom,
      });
      // prevent map from zooming less than 8.5
      map.current.setMinZoom(9);
      // prevent map lat from going 2 degrees beyond the starting location
      map.current.setMaxBounds([
        [lng - 1, lat - .6],
        [lng + 1, lat + .6],
      ]);
      // prevent the camera from changing pitch or bearing
      map.current.dragRotate.disable();
    }
  }, [lng, lat, zoom]);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      if (map.current) {
        setLng(Number(map.current.getCenter().lng.toFixed(4)));
        setLat(Number(map.current.getCenter().lat.toFixed(4)));
        setZoom(Number(map.current.getZoom().toFixed(2)));
      }
    });
  });

  return (
    <div className="h-screen">
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
