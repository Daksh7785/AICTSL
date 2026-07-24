import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-transit-ink text-white hover:bg-blue-900 focus:ring-transit-ink',
    accent: 'bg-signal-amber text-ink hover:bg-yellow-500 focus:ring-signal-amber',
    alert: 'bg-alert-red text-white hover:bg-red-700 focus:ring-alert-red',
    outline: 'border-2 border-transit-ink text-transit-ink hover:bg-gray-100 focus:ring-transit-ink',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;

// style updates
