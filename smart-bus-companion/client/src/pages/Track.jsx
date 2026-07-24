import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import BusOnRibbon from '../components/ui/BusOnRibbon';
import RouteChip from '../components/ui/RouteChip';
import { Bus, MapPin } from 'lucide-react';

const stopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // A simple bus icon
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const StopPopup = ({ routeId, stopInfo }) => {
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/routes/${routeId}/predicted-eta?stopId=${stopInfo.stopId._id}`)
      .then(res => res.json())
      .then(data => {
        setEta(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [routeId, stopInfo.stopId._id]);

  return (
    <Popup>
      <div className="font-semibold mb-2">{stopInfo.stopId.name}</div>
      {loading ? (
        <div className="text-xs text-gray-500 animate-pulse">Calculating ETA...</div>
      ) : eta ? (
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Scheduled:</span>{' '}
            <span className="font-mono-data font-semibold">
              {new Date(eta.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-1 group relative justify-between mt-1 pt-1 border-t border-gray-100">
            <span className="text-gray-500">Predicted:</span>{' '}
            <span className={`font-mono-data font-bold ${Math.abs(eta.predictedDelayMinutes) > 3 ? (eta.predictedDelayMinutes > 0 ? "text-red-600" : "text-transit-green") : "text-gray-800"}`}>
              {new Date(eta.predictedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
              Predicted time is based on this route's recent historical pattern, not just current GPS position.
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-red-500">ETA unavailable</div>
      )}
    </Popup>
  );
};

const Track = () => {
  const { routeId } = useParams();
  const [route, setRoute] = useState(null);
  const [buses, setBuses] = useState({}); // busId -> position state
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Fetch route details
    fetch(`/api/routes/${routeId}`)
      .then(res => res.json())
      .then(data => {
        setRoute(data);
        setLoading(false);
      })
      .catch(console.error);

    // 2. Setup Socket.io
    const socketUrl = import.meta.env.DEV ? 'http://localhost:5000' : '/';
    socketRef.current = io(socketUrl);

    socketRef.current.emit('joinRoute', routeId);

    socketRef.current.on('busPositionUpdate', (data) => {
      if (data.routeId === routeId) {
        setBuses(prev => ({
          ...prev,
          [data.busId]: data
        }));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveRoute', routeId);
        socketRef.current.disconnect();
      }
    };
  }, [routeId]);

  if (loading) {
    return (
      <div className="flex justify-center mt-12 px-8">
        <BusOnRibbon color="var(--transit-ink)" />
      </div>
    );
  }

  if (!route || !route.stops) {
    return <div className="text-center mt-10">Route not found or unavailable.</div>;
  }

  // INDORE center
  const center = route.stops && route.stops.length > 0 
    ? [route.stops[0].stopId.location.coordinates[1], route.stops[0].stopId.location.coordinates[0]]
    : [22.7196, 75.8577];

  const positions = route.stops.map(s => [
    s.stopId.location.coordinates[1],
    s.stopId.location.coordinates[0]
  ]);

  return (
    <div className="max-w-4xl mx-auto mt-4 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="flex items-center gap-4">
            <RouteChip routeNumber={route.routeNumber} colorHex={route.colorHex} />
            <Badge variant="primary" className="animate-pulse flex items-center gap-1 bg-transit-green/20 text-transit-green border-transit-green/30">
              <span className="w-2 h-2 rounded-full bg-transit-green block"></span> Live
            </Badge>
          </div>
          <p className="text-gray-500 mt-1 font-medium">{route.name}</p>
        </div>
      </div>

      <Card className="flex-grow overflow-hidden relative shadow-lg">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          <Polyline positions={positions} color="var(--transit-ink)" weight={4} opacity={0.6} />

          {route.stops.map((stopInfo) => (
            <Marker 
              key={stopInfo._id} 
              position={[stopInfo.stopId.location.coordinates[1], stopInfo.stopId.location.coordinates[0]]}
              icon={stopIcon}
            >
              <StopPopup routeId={routeId} stopInfo={stopInfo} />
            </Marker>
          ))}

          {Object.values(buses).map((busData) => (
            <Marker 
              key={busData.busId}
              position={busData.position}
              icon={busIcon}
            >
              <Popup>
                <div className="font-bold">Live Bus</div>
                <div className="text-sm text-gray-600 capitalize">Status: {busData.status}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>
    </div>
  );
};

export default Track;

// style updates
