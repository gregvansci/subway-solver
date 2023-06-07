import { useRef, useEffect, useState, Fragment } from "react";
import mapboxgl from "mapbox-gl";
import cities from "./data/cities.json";
import mapbox_access from "./data/mapbox.json";
import map_bg from "./assets/map-bg.jpg";
import logomark from "./assets/logomark.png";
import search from "./assets/city.svg";
import plus from "./assets/plus.svg";
import minus from "./assets/minus.svg";
import open from "./assets/up.svg";
import download from "./assets/download.svg";
import link from "./assets/link.svg";

import { Combobox, Transition } from "@headlessui/react";

const logos = [
  ["SUBWAY", "SOLVER"], 
  ["TRANSIT", "TUTOR"], 
  ["METRO", "MAPPER"],
  ["LINE", "LINK"],
  ["ROUTE", "RUNNER"],
  ["PATH", "PLOTTER"]
];

mapboxgl.accessToken = mapbox_access.token;

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(cities["Los Angeles"].lon);
  const [lat, setLat] = useState(cities["Los Angeles"].lat);
  const [zoom, setZoom] = useState(cities["Los Angeles"].zoom);
  const [logo, setLogo] = useState(logos[0]);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [stationCount, setStationCount] = useState(0);
  const numbers = Array.from({ length: 24 }, (_, i) => i + 1);
  const numberRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [selectedCity, setSelectedCity] = useState("Los Angeles");
  const [query, setQuery] = useState("");

  const scrollToLeft = () => {
    const newLineCount = Math.max(lineCount - 1, 1);  
    numberRefs.current[newLineCount - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const scrollToRight = () => {
    const newLineCount = Math.min(lineCount + 1, 24);
    numberRefs.current[newLineCount - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  useEffect(() => {
      numberRefs.current = numberRefs.current.slice(0, numbers.length);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const halfWidth = scrollContainerRef.current.offsetWidth / 2;
        const center = scrollContainerRef.current.scrollLeft + halfWidth;

        let minDist = Infinity;
        let closestIndex = -1;

        numberRefs.current.forEach((numberRef, index) => {
          if (numberRef) {
            const childCenter =
              numberRef.offsetLeft + numberRef.offsetWidth / 2;
            const dist = Math.abs(center - childCenter);

            if (dist < minDist) {
              minDist = dist;
              closestIndex = index;
            }
          }
        });

        if (closestIndex !== -1) {
          setLineCount(closestIndex + 1);
        }
      }
    };

    scrollContainerRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    console.log(lineCount);
  }, [lineCount]);

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
      <div className="absolute top-0 left-0 m-[6px] flex flex-row gap-[6px] ">
        <div
          onClick={() =>
            setLogo(logos[Math.floor(Math.random() * logos.length)])
          }
          className="flex flex-row h-full bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg px-2 py-[7px] bg-opacity-[67%] cursor-pointer"
        >
          <img
            className="h-10 my-auto border-2 rounded-full border-[hsl(244,27%,20%)]"
            src={logomark}
            alt="Logomark"
          />
          <h1 className="w-20 my-auto text-lg font-normal leading-none text-center">
            {logo[0]} <span className="font-bold tracking-wide">{logo[1]}</span>
          </h1>
        </div>
        <div className="w-64 h-[65.39px] ">
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
        <div className="flex flex-row gap-[6px] gap-between px-2 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg bg-opacity-[67%]">
          <div className="bg-[hsl(221,39%,11%)] bg-opacity-[45%] rounded-full w-10 h-10 m-auto">
            <button className="w-full h-full" onClick={scrollToLeft}>
              <img
                src={minus}
                alt="Increment line count"
                className="h-6 m-auto"
              />
            </button>
          </div>
          <div className="relative w-40 mt-[7px]">
            <div className="absolute flex items-center">
              <div
                ref={scrollContainerRef}
                className="flex flex-row w-40 px-20 overflow-x-scroll snap-mandatory snap-x no-scrollbar"
              >
                {numbers.map((number, index) => (
                  <div
                    key={number}
                    ref={(el) => (numberRefs.current[index] = el)}
                    className="text-xl text-center snap-center"
                    style={{ minWidth: "60px" }}
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[hsl(221,39%,75%)] mx-auto bg-opacity-40 w-[36px] h-[36px] rounded-full"></div>
            <p className="w-full text-[#DDD] text-xs text-center align-bottom">
              No. of Lines
            </p>
          </div>
          <div className="bg-[hsl(221,39%,11%)] bg-opacity-[45%] rounded-full w-10 h-10 m-auto">
            <button className="w-full h-full" onClick={scrollToRight}>
              <img
                src={plus}
                alt="Increment line count"
                className="h-6 m-auto"
              />
            </button>
          </div>
        </div>
        <div className="flex flex-row text-[#DDD] gap-2 px-2 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg bg-opacity-[67%]">
          <p className="m-auto text-xl">Station Count:</p>
          <p className="m-auto text-2xl font-semibold text-white">
            {stationCount}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-[6px] absolute bottom-0 right-0 m-[6px] mb-8">
        <div
          className={`flex flex-col ${
            toolboxOpen ? "visible" : "hidden"
          } h-20 w-10 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-full bg-opacity-[67%] overflow-hidden`}
        >
          <button className="w-full h-full">
            <img src={link} alt="Link" className="h-6 pt-1 m-auto" />
          </button>
          <button className="w-full h-full">
            <img src={download} alt="Download" className="h-6 pb-1 m-auto" />
          </button>
        </div>
        <div onClick={() => setToolboxOpen(!toolboxOpen)}>
          <button className="w-10 h-10 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-full bg-opacity-[67%]">
            <img
              src={open}
              alt="Open"
              className={`h-5 m-auto ${toolboxOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        <div className="flex flex-col h-20 w-10 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-full bg-opacity-[67%] overflow-hidden">
          <button className="w-full h-full">
            <img src={plus} alt="Zoom In" className="pt-1 m-auto h-7" />
          </button>
          <button className="w-full h-full">
            <img src={minus} alt="Zoom Out" className="pb-1 m-auto h-7" />
          </button>
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
