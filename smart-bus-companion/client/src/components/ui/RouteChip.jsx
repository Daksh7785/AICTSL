import React from 'react';

const RouteChip = ({ routeNumber, colorHex, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Route Ribbon/Chip Line */}
      <div 
        className="w-1.5 h-6 rounded-full" 
        style={{ backgroundColor: colorHex || 'var(--transit-ink)' }} 
      />
      {/* Route Number */}
      <span className="font-display font-bold text-lg text-ink">
        {routeNumber}
      </span>
    </div>
  );
};

export default RouteChip;
