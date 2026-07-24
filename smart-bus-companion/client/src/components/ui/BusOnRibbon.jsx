import React from 'react';
import { Bus } from 'lucide-react';

const BusOnRibbon = ({ color = 'var(--signal-amber)', occupancy = 'low', className = '' }) => {
  const getOccupancyColor = () => {
    switch (occupancy) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': default: return 'bg-green-500';
    }
  };

  return (
    <div className={`relative w-full h-8 flex items-center overflow-hidden ${className}`}>
      {/* The Ribbon */}
      <div 
        className="absolute w-full h-1 rounded-full" 
        style={{ backgroundColor: color, opacity: 0.2 }}
      />
      <div 
        className="absolute w-full h-1 rounded-full motion-safe:animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" 
        style={{ backgroundColor: color }}
      />
      
      {/* The Bus */}
      <div className="absolute left-0 motion-safe:animate-[busTravel_2s_ease-in-out_infinite] motion-reduce:opacity-50">
        <div 
          className="relative bg-white rounded-full p-1 shadow-sm border"
          style={{ borderColor: color }}
        >
          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ${getOccupancyColor()}`} title={`Crowding: ${occupancy}`} />
          <Bus size={16} color={color} />
        </div>
      </div>

      <style jsx="true">{`
        @keyframes busTravel {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(300px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BusOnRibbon;

// style updates
