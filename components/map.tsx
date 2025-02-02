import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

type Station = {
  name: string;
  position: LatLngLiteral;
};

type GORoute = {
  name: string;
  origin: LatLngLiteral;
  destination: LatLngLiteral;
  color: string;
};

// Define GO Transit routes with accurate coordinates
const goRoutes: GORoute[] = [
  {
    name: "Lakeshore West",
    origin: { lat: 43.645557, lng: -79.380831 }, // Union Station
    destination: { lat: 43.1088, lng: -79.0633 }, // Burlington GO
    color: "#8B0000", // Dark red
  },
  {
    name: "Milton",
    origin: { lat: 43.645557, lng: -79.380831 }, // Union Station
    destination: { lat: 43.522616, lng: -79.882749 }, // Milton GO
    color: "#F37021",
  },
  {
    name: "Kitchener",
    origin: { lat: 43.645557, lng: -79.380831 }, // Union Station
    destination: { lat: 43.451638, lng: -80.491504 }, // Kitchener GO
    color: "#00853F",
  },
  {
    name: "Lakeshore East",
    origin: { lat: 43.645557, lng: -79.380831 }, // Union Station
    destination: { lat: 43.891293, lng: -78.862605 }, // Oshawa GO
    color: "#FF4500", // Orangish Red
  },
  {
    name: "UP Express",
    origin: { lat: 43.645557, lng: -79.380831 }, // Union Station
    destination: { lat: 43.681923, lng: -79.613623 }, // Pearson Airport
    color: "#F2A900",
  },
  {
    name: "Barrie",
    origin: { lat: 43.645557, lng: -79.380831 },
    destination: { lat: 44.377315, lng: -79.668274 }, // Allandale Waterfront GO
    color: "#005D99",
  },
  // Add more routes as needed
];

export default function Map() {
  // Generalising office location to Financial District
  const office = { lat: 43.6479, lng: -79.3818 };
  const [house, setHouse] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult>();
  
  // Reference to the map instance
  const mapRef = useRef<google.maps.Map>();
  
  // Map configuration options
  const options = useMemo<MapOptions>(() => ({
    mapId: "ddedbcc04de5b18f",
    disableDefaultUI: true,
    clickableIcons: false,
  }), []);

  // Callback to store map reference when map loads
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  

  // Calculate driving directions between a house and the office
  const fetchDirections = (house: LatLngLiteral) => {
    if (!house) return;
    const service = new google.maps.DirectionsService();
    service.route({
      origin: house,
      destination: office,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === "OK" && result) {
        setDirections(result);
      }
    });
  };

  // Add state for GO Transit directions
  const [goDirections, setGoDirections] = useState<{ [key: string]: DirectionsResult }>({});

  // Fetch GO Transit routes when component mounts
  useEffect(() => {
    const fetchGORoutes = async () => {
      const directionsService = new google.maps.DirectionsService();

      for (const route of goRoutes) {
        try {
          const result = await directionsService.route({
            origin: route.origin,
            destination: route.destination,
            travelMode: google.maps.TravelMode.TRANSIT,
            transitOptions: {
              modes: [google.maps.TransitMode.RAIL],
              routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
            },
          });
          
          setGoDirections(prev => ({
            ...prev,
            [route.name]: result
          }));
        } catch (error) {
          console.error(`Error fetching route ${route.name}:`, error);
        }
      }
    };

    fetchGORoutes();
  }, []);


  return (
  <div className="container">
      <div className="controls">
        <h1>Why Go Transit?</h1>
        {!house && <p>How much will it cost you to drive to work if you live in GTA and work in Toronto and missing out on <span className="highlight">GO Transit?</span></p>}
        <Places 
          setHouse={(position) => {
            setHouse(position);
            mapRef.current?.panTo(position);
          }} 
          fetchDirections={fetchDirections}
        />
        {directions && <Distance leg={directions.routes[0].legs[0]} />}
        {console.log(directions)}
      </div>
      <div className="map">
        <GoogleMap
          zoom={10}
          mapContainerClassName="map-container"
          center={office}
          options={options}
          onLoad={onLoad}
        >

          {house && (
            <Marker
              position={house}
              options={{
                animation: google.maps.Animation.DROP,
              }}
            />
          )}

          <Marker
            position={office}
            options={{
              animation: google.maps.Animation.DROP,
              icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                fillColor: "#00FF00",
                fillOpacity: 0.5,
                scale: 10,
              },
            }}
          />
          {Object.entries(goDirections).map(([routeName, directions]) => (
            <DirectionsRenderer
              key={routeName}
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: goRoutes.find(r => r.name === routeName)?.color,
                  strokeWeight: 4,
                  strokeOpacity: 0.8,
                  zIndex: 50,
                },
                preserveViewport: true,
                routeIndex: 0,
                suppressBicyclingLayer: true,
                suppressPolylines: false,
                suppressInfoWindows: true,
                hideRouteList: true,
                markerOptions: {
                  visible: false
                }
              }}
            />
          ))}

          {directions && (
            <DirectionsRenderer
             directions={directions}
             options={{
              polylineOptions: {
                strokeColor: "#000000",
                strokeWeight: 5,
                zIndex: 100,
              },
             }} />
          )}
        </GoogleMap>
      </div>
    </div>
  )
}
