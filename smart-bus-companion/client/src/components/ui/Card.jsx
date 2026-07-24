import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-[2px] motion-safe:hover:shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;
