import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Map, Clock, IndianRupee, Accessibility, Bell, Train } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import BusOnRibbon from '../components/ui/BusOnRibbon';
import RouteChip from '../components/ui/RouteChip';
import { usePreferences } from '../context/PreferencesContext';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const { t } = usePreferences();
  
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!from || !to) return;
    
    setLoading(true);
    fetch(`/api/search?from=${from}&to=${to}`)
      .then(res => res.json())
      .then(data => {
        setRoutes(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [from, to]);

  const handleNotify = () => {
    alert(t('bus.notify') + ": You will be alerted when the bus is 5 minutes away.");
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-12 px-8">
        <BusOnRibbon color="var(--transit-ink)" occupancy="low" />
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center">
        <Card className="p-8 bg-gray-50 border-dashed border-2 border-gray-300">
          <Map className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Routes Found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't find a direct bus for this journey. Please check if the Route Finder is set up correctly for this stop combination.
          </p>
          <Link to="/">
            <Button variant="outline">Try Another Search</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Routes</h1>
        <Link to="/">
          <Button variant="outline" className="text-sm py-1 px-3">Edit Search</Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {routes.map((route) => (
          <Card 
            key={route._id} 
            className="p-5 border-l-[5px]"
            style={{ borderLeftColor: route.colorHex || 'var(--transit-ink)' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <RouteChip routeNumber={route.routeNumber} colorHex={route.colorHex} />
                  {route.isWheelchairAccessible && (
                    <Accessibility className="w-5 h-5 text-transit-green" aria-label="Wheelchair Accessible" title="Wheelchair Accessible" />
                  )}
                  {route.hasMetroInterchange && (
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50 ml-1">
                      <Train className="w-3 h-3 mr-1 inline-block" />
                      Metro Interchange
                    </Badge>
                  )}
                  {route.occupancyStatus && (
                    <Badge variant="outline" className={`text-xs ml-auto ${
                      route.occupancyStatus === 'low' ? 'text-green-600 border-green-200' :
                      route.occupancyStatus === 'medium' ? 'text-yellow-600 border-yellow-200' :
                      'text-red-600 border-red-200'
                    }`}>
                      {route.occupancyStatus} crowding
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-ink">{route.name}</h3>
                <p className="text-sm text-gray-500 font-medium">{route.numberOfStops} stops away</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end font-bold text-2xl text-ink font-display">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  <span>{route.fare}</span>
                </div>
                <div className="flex items-center justify-end text-sm text-gray-600 mt-1 gap-1 font-display">
                  <Clock className="w-4 h-4" />
                  <span>~{route.estimatedDurationMinutes} mins</span>
                </div>
                {route.predictedDelayMinutes !== undefined && route.predictedDelayMinutes !== 0 && (
                  <div className={`flex items-center justify-end text-xs mt-1 font-bold ${route.predictedDelayMinutes > 0 ? 'text-red-600' : 'text-transit-green'}`}>
                    {route.predictedDelayMinutes > 0 ? `+${route.predictedDelayMinutes} min delay` : `${route.predictedDelayMinutes} min early`} (ETA Engine)
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <Button variant="outline" className="flex items-center gap-2 text-signal-amber border-signal-amber hover:bg-yellow-50" onClick={handleNotify}>
                <Bell className="w-4 h-4" />
                {t('bus.notify')}
              </Button>
              <Link to={`/track/${route._id}`}>
                <Button variant="accent" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  {t('track.live')}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;

// style updates
