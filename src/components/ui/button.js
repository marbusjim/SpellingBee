import React from 'react';

export const Button = ({ children, onClick, className, variant }) => {
  return (
    <button onClick={onClick} className={`btn ${variant} ${className}`}>
      {children}
    </button>
  );
};