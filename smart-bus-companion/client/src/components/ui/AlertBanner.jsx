import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AlertTriangle, Info } from 'lucide-react';

const AlertBanner = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Initial fetch of active alerts
    fetch('/api/alerts/active')
      .then(res => res.json())
      .then(data => {
        setAlerts(Array.isArray(data) ? data : []);
      })
      .catch(console.error);

    // Setup Socket.io for live updates
    const socketUrl = import.meta.env.DEV ? 'http://localhost:5000' : '/';
    const socket = io(socketUrl);

    socket.on('newServiceAlert', (alert) => {
      setAlerts(prev => {
        // If alert is no longer active, remove it
        if (!alert.active) {
          return prev.filter(a => a._id !== alert._id);
        }
        // Update or insert
        const exists = prev.find(a => a._id === alert._id);
        if (exists) {
          return prev.map(a => a._id === alert._id ? alert : a);
        } else {
          return [alert, ...prev];
        }
      });
    });

    return () => socket.disconnect();
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="w-full z-50 relative">
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

// style updates
