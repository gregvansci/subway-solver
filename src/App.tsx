import { useRef, useEffect, useState, Fragment } from "react";
import mapboxgl from "mapbox-gl";
import cities from "./data/cities.json";
import mapbox_access from "./data/mapbox.json";
import map_bg from "./assets/map-bg.jpg";
import logomark from "./assets/logomark.png";
import search from "./assets/city.svg";

import { Combobox, Transition } from "@headlessui/react";

mapboxgl.accessToken = mapbox_access.token;

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(cities["Los Angeles"].lon);
  const [lat, setLat] = useState(cities["Los Angeles"].lat);
  const [zoom, setZoom] = useState(cities["Los Angeles"].zoom);

  const [selectedCity, setSelectedCity] = useState("Los Angeles");
  const [query, setQuery] = useState("");

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

  const filteredCities =
    query === ''
    ? Object.keys(cities)
    : Object.keys(cities).filter((city) => {
      return city.toLowerCase().includes(query.toLowerCase())
    })

  return (
    <div className="h-screen text-white">
      <div className="absolute top-0 left-0 m-[6px] flex flex-row gap-[6px]">
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
        <div className="w-64 h-[71.38px] ">
          <Combobox value={selectedCity} onChange={setSelectedCity}>
            <div className="flex flex-row gap-3 h-full p-2 px-3 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg bg-opacity-[67%] outline-none">
              <Combobox.Button>
                <img
                  src={search}
                  alt="search"
                  className="w-6 h-6"
                  aria-hidden="true"
                />
              </Combobox.Button>
              <Combobox.Input
                className="w-full h-full pb-[4px] text-2xl bg-transparent outline-none align-center"
                placeholder="Choose a city"
                onChange={(event) => setQuery(event.currentTarget.value)}
              />
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}
            >
              <Combobox.Options className="w-64 h-auto p-2 mt-2 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg bg-opacity-[67%]">
                {filteredCities.map((city) => (
                  <Combobox.Option
                    key={city}
                    value={city}
                    className="w-full h-8 px-2 text-xl bg-transparent outline-none align-center"
                  >
                    {city}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Transition>
          </Combobox>
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
