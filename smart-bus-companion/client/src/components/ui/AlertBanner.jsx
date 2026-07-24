import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AlertTriangle, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const AlertBanner = () => {
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [liveSurge, setLiveSurge] = useState(null);

  const { data: initialAlerts = [] } = useQuery({
    queryKey: ['activeAlerts'],
    queryFn: async () => {
      const { data } = await axios.get('/api/alerts/active');
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: initialSurge = null } = useQuery({
    queryKey: ['surgeConfig'],
    queryFn: async () => {
      const { data } = await axios.get('/api/surge');
      return data;
    }
  });

  useEffect(() => {
    // Setup Socket.io for live updates
    const socketUrl = import.meta.env.DEV ? 'http://localhost:5000' : '/';
    const socket = io(socketUrl);

    socket.on('newServiceAlert', (alert) => {
      setLiveAlerts(prev => {
        if (!alert.active) return prev.filter(a => a._id !== alert._id);
        const exists = prev.find(a => a._id === alert._id);
        if (exists) return prev.map(a => a._id === alert._id ? alert : a);
        return [alert, ...prev];
      });
    });

    socket.on('surgeUpdate', (newSurge) => {
      setLiveSurge(newSurge);
    });

    return () => socket.disconnect();
  }, []);

  // Merge live data with initial fetched data
  const surge = liveSurge !== null ? liveSurge : initialSurge;
  
  // For alerts, liveAlerts takes precedence if it exists in live updates, otherwise fallback to initial
  const alerts = [...liveAlerts];
  initialAlerts.forEach(a => {
    if (!alerts.find(la => la._id === a._id)) {
      alerts.push(a);
    }
  });

  if (alerts.length === 0 && (!surge || !surge.isActive)) return null;

  return (
    <div className="w-full z-50 relative">
      {surge && surge.isActive && (
        <div className="px-4 py-2 text-sm flex items-center justify-center gap-2 font-medium bg-purple-600 text-white shadow-md">
          <Info className="w-4 h-4" />
          <span>{surge.message}</span>
        </div>
      )}
      {alerts.map(alert => (
        <div 
          key={alert._id} 
          className={`px-4 py-2 text-sm flex items-center justify-center gap-2 font-medium ${
            alert.severity === 'critical' ? 'bg-alert text-white' :
            alert.severity === 'warning' ? 'bg-accent text-gray-900' :
            'bg-blue-500 text-white'
          }`}
        >
          {alert.severity === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          <span>
            {alert.routeId && `[Route ${alert.routeId.routeNumber}] `}
            {alert.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
