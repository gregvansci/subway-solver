import { useRef, useEffect, useState, Fragment } from "react";
import mapboxgl from "mapbox-gl";
import cities from "./data/cities.json";
import mapbox_access from "./data/mapbox.json";
import map_bg from "./assets/map-bg.jpg";
import logomark from "./assets/logomark.png";
import search from "./assets/city.svg";
import plus from "./assets/plus.svg";
import minus from "./assets/minus.svg";
import chevron from "./assets/up.svg";
import download from "./assets/download.svg";
import link from "./assets/link.svg";
import hint from "./assets/hint.svg";

import { Combobox, Dialog, Transition } from "@headlessui/react";

mapboxgl.accessToken = mapbox_access.token;

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(cities["Los Angeles"].lon);
  const [lat, setLat] = useState(cities["Los Angeles"].lat);
  const [zoom, setZoom] = useState(cities["Los Angeles"].zoom);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [stationCount, setStationCount] = useState(0);
  const numbers = Array.from({ length: 32 }, (_, i) => i + 1);
  const numberRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [computeDisabled, setComputeDisabled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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
    const newLineCount = Math.min(lineCount + 1, 32);
    numberRefs.current[newLineCount - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const scrollToIndex = (number: number) => {
    numberRefs.current[number - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
  
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (container) {
        const direction = Math.sign(e.deltaY);
        container.scrollLeft += direction * 40; // change 40 to the amount you want to scroll
      }
    };
  
    if (container) {
      container.addEventListener("wheel", handleWheel);
      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }
  }, []);

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

  function openInstructions()  { setShowInstructions(true) }

  function closeInstructions() { setShowInstructions(false) }

  return (
    <div className="w-screen h-screen overflow-hidden text-white">
      {/* HEADER */}
      <div className="absolute top-0 left-0 pt-[6px] px-[6px] w-screen flex flex-row gap-[6px] z-20">
        {/* LOGO COMPONENT */}
        <div className="flex flex-row gap-[6px] h-[3.5rem] min-w-[8.375rem] select-none bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg px-2 py-[7px] bg-opacity-[67%]">
          <img
            className="h-10 my-auto border-2 rounded-full border-[hsl(244,27%,20%)]"
            src={logomark}
            alt="Logomark"
          />
          <div className="flex flex-col min-w-0 my-auto text-lg leading-none text-center">
            <h1 className="font-normal">SUBWAY</h1>
            <h1 className="font-bold tracking-wide">SOLVER</h1>
          </div>
        </div>

        {/* CITY SEARCH BAR */}
        <div className="w-full h-auto">
          <Combobox value={selectedCity} onChange={setSelectedCity}>
            {/* SEARCH BAR */}
            <div className="flex flex-row gap-3 h-[3.5rem] py-2 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg bg-opacity-[67%] outline-none">
              <Combobox.Button>
                <img
                  src={search}
                  alt="search"
                  className="w-6 h-6 mx-3"
                  aria-hidden="true"
                />
              </Combobox.Button>
              <Combobox.Input
                className="w-full h-full pb-[4px] text-2xl bg-transparent outline-none align-center"
                placeholder="Choose a city"
                onChange={(event) => setQuery(event.currentTarget.value)}
                onClick={(event) => event.currentTarget.select()}
              />
              <Combobox.Button>
                <img
                  src={chevron}
                  alt="chevron"
                  className="w-6 h-6 mr-3 rotate-180"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>

            {/* DROPDOWN */}
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}
            >
              <Combobox.Options className="w-full h-auto py-2 mt-[6px] bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg bg-opacity-[67%]">
                {filteredCities.map((city) => (
                  <Combobox.Option
                    key={city}
                    value={city}
                    className="w-full py-1 px-4 text-xl m-0 bg-transparent outline-none align-center cursor-pointer hover:bg-[hsl(221,39%,55%)]"
                  >
                    {city}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Transition>
          </Combobox>
        </div>

        {/* LINE COUNT SELECTOR */}
        <div className="flex flex-row h-[3.5rem] gap-[6px] gap-between px-2 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg bg-opacity-[67%] select-none">
          <div className="bg-[hsl(221,39%,11%)] hover:bg-opacity-[60%] bg-opacity-[45%] rounded-full w-10 h-10 m-auto">
            <button className="w-full h-full" onClick={scrollToLeft}>
              <img
                src={minus}
                alt="Increment line count"
                className="h-6 m-auto"
              />
            </button>
          </div>
          <div className="relative w-[200px] mt-[7px]">
            <div className="absolute flex items-center">
              <div
                ref={scrollContainerRef}
                className="flex flex-row w-[200px] px-20 overflow-x-scroll snap-mandatory snap-x no-scrollbar"
              >
                {numbers.map((number, index) => (
                  <div
                    onClick={() => scrollToIndex(index + 1)}
                    key={number}
                    ref={(el) => (numberRefs.current[index] = el)}
                    className="text-lg text-center cursor-pointer snap-center"
                    style={{ minWidth: "40px" }}
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[hsl(221,39%,70%)] mx-auto bg-opacity-40 w-7 h-7 rounded-full"></div>
            <p className="w-full text-[#DDD] text-xs text-center align-bottom">
              No. of Lines
            </p>
          </div>
          <div className="bg-[hsl(221,39%,11%)] hover:bg-opacity-[60%] bg-opacity-[45%] rounded-full w-10 h-10 m-auto">
            <button className="w-full h-full" onClick={scrollToRight}>
              <img
                src={plus}
                alt="Increment line count"
                className="h-6 m-auto"
              />
            </button>
          </div>
        </div>

        {/* STATION COUNT */}
        <div className="flex flex-row h-[3.5rem] text-[#DDD] w-[240px] select-none px-4 gap-2 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-lg bg-opacity-[67%]">
          <p className="m-auto text-xl whitespace-nowrap">Station Count:</p>
          <p className="m-auto text-2xl font-semibold text-white">
            {stationCount}
          </p>
        </div>

        {/* COMPUTE BUTTON */}
        <button
          className={`bg-[hsl(221,39%,45%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(221,39%,11%)] focus-visible:ring-opacity-75 ${
            computeDisabled
              ? "bg-opacity-40 cursor-not-allowed"
              : "bg-opacity-60 hover:bg-opacity-75"
          } h-[3.5rem] w-40 rounded-[20px] px-8 inset-10`}
          disabled={computeDisabled}
        >
          <p className="text-xl font-medium">Compute</p>
        </button>
      </div>

      {/* SIDE PANEL */}
      <div className="flex flex-col gap-[6px] z-20 absolute bottom-0 right-0 m-[6px] mb-8">
        <div
          className={`flex flex-col ${
            toolboxOpen ? "visible" : "hidden"
          } h-20 w-10 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-full bg-opacity-[67%] overflow-hidden`}
        >
          <button className="w-full h-full">
            <img src={link} alt="Link" className="pt-1 m-auto h-7" />
          </button>
          <button className="w-full h-full">
            <img src={download} alt="Download" className="h-6 pb-1 m-auto" />
          </button>
        </div>
        <button
          onClick={() => setToolboxOpen(!toolboxOpen)}
          className="w-10 h-10 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-full bg-opacity-[67%]"
        >
          <img
            src={chevron}
            alt="Open"
            className={`h-6 m-auto ${toolboxOpen ? "rotate-180" : ""}`}
          />
        </button>
        <button
          className="w-10 h-10 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-full bg-opacity-[67%]"
          onClick={openInstructions}
        >
          <img src={hint} alt="Hint" className="h-6 m-auto" />
        </button>
        <div className="flex flex-col h-20 w-10 bg-[hsl(221,39%,11%)] border-[1px] border-[hsl(221,39%,61%)] rounded-full bg-opacity-[67%] overflow-hidden">
          <button className="w-full h-full">
            <img src={plus} alt="Zoom In" className="h-8 pt-1 m-auto" />
          </button>
          <button className="w-full h-full">
            <img src={minus} alt="Zoom Out" className="h-8 pb-1 m-auto" />
          </button>
        </div>
      </div>

      {/* MAP IMAGE */}
      <div className="z-0 w-full h-full">
        <img src={map_bg} alt="Los Angeles" />
      </div>

      {/* WELCOME MODAL */}
      <Transition appear show={showInstructions} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={closeInstructions}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl p-6 px-12 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="mb-8 text-2xl font-medium leading-6 text-center text-gray-900"
                  >
                    Welcome to Subway Solver
                  </Dialog.Title>
                  {/* <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Part 1
                    </p>
                  </div> */}
                  <Dialog.Description>
                    <ol type="1" className="list-decimal">
                      <li className="text-gray-700">
                        <span className="font-bold text-black">
                          Select a City:
                        </span>{" "}
                        Begin by typing a city into the search bar.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-bold text-black">
                          Add Locations:
                        </span>{" "}
                        Click on the map to add desired station locations.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-bold text-black">
                          Specify Number of Lines:
                        </span>{" "}
                        Adjust the slider to select the number of lines you'd
                        like your network to contain.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-bold text-black">
                          Designate Important Locations (optional):
                        </span>{" "}
                        Assign specific flags to locations to indicate their use
                        or importance. For example, you can flag a location as a
                        "Transfer" or "Airport" station.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-bold text-black">
                          Calculate Optimal Network:
                        </span>{" "}
                        When you're ready, click the "Compute" button to
                        generate the most efficient subway lines based on your
                        inputs.
                      </li>
                      <li className="text-gray-700">
                        <span className="font-bold text-black">
                          Optimize your Network:
                        </span>{" "}
                        Make adjustments to your network and recalculate as
                        needed.
                      </li>
                    </ol>
                  </Dialog.Description>
                  <div className="flex w-full mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 ml-auto font-medium bg-[hsl(221,39%,65%)] text-[hsl(221,39%,95%)] border border-transparent rounded-md text-md hover:bg-[hsl(221,39%,55%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeInstructions}
                    >
                      Get Started
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* EXAMPLE STATS */}
      {/* <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>  */}

      {/* MAP CONTAINER */}
      {/* <div ref={mapContainer} className="z-0 map-container" /> */}
    </div>
  );
}
