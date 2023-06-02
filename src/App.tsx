import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import cities from "./data/cities.json";
import mapbox_access from "./data/mapbox.json";
import map_bg from "./assets/map-bg.jpg";
import logomark from "./assets/logomark.png";


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
    <div className="h-screen text-white">
      <div className="absolute top-0 left-0 m-[6px]">
        <div className="flex flex-row h-full bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg px-2 py-2 bg-opacity-[67%]">
          <img
            className="h-10 my-auto border-2 rounded-full border-[hsl(244,27%,20%)]"
            src={logomark}
            alt="Logomark"
          />
          <h1 className="w-20 my-auto text-lg font-normal leading-none text-center">
            SUBWAY <span className="font-bold tracking-wide">SOLVER</span>
          </h1>
        </div>
      </div>
      <div className="w-full h-full">
        <img src={map_bg} alt="Los Angeles" />
      </div>
      {/* <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" /> */}
    </div>
  );
}
