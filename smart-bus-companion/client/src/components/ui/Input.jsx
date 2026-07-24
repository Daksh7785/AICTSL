import React from 'react';

const Input = ({ label, className = '', ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <input
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        {...props}
      />
    </div>
  );
};

export default Input;
