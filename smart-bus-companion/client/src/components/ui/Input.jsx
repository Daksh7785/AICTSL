import React from 'react';

const Input = ({ label, className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm font-semibold text-transit-ink">{label}</label>}
      <input
        className="px-3 py-2 bg-white border-2 border-gray-200 rounded-md focus:outline-none focus:border-transit-ink font-mono-data transition-colors"
        {...props}
      />
    </div>
  );
};

export default Input;

// style updates
