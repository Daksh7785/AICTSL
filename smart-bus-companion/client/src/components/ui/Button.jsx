import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-800 focus:ring-primary',
    accent: 'bg-accent text-gray-900 hover:bg-yellow-500 focus:ring-accent',
    alert: 'bg-alert text-white hover:bg-red-700 focus:ring-alert',
    outline: 'border-2 border-primary text-primary hover:bg-blue-50 focus:ring-primary',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
