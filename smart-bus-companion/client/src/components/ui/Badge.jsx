import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-transit-green/10 text-transit-green',
    alert: 'bg-alert-red/10 text-alert-red',
    warning: 'bg-signal-amber/20 text-yellow-800',
    primary: 'bg-transit-ink/10 text-transit-ink',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

// style updates
