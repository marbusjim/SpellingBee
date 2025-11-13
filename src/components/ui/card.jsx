import React from 'react';

export const Card = ({ children, className, style }) => (
  <div className={`card ${className}`} style={style}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h1 className={`card-title ${className}`}>
    {children}
  </h1>
);

export const CardContent = ({ children, className }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
);
