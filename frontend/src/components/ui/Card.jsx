import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-surface-container noise-overlay clip-punch outline-variant border border-outline-variant transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,255,194,0.1)] group/card ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const CardHeader = ({ title, status, identifier }) => {
  return (
    <div className="bg-surface-container-high p-4 flex justify-between items-center clip-punch">
      <div className="flex gap-4 items-center">
        {status && (
          <span className={`px-2 py-1 text-xs font-mono uppercase border ${
            status === 'VALID' ? 'border-secondary text-secondary' : 
            status === 'INVALID' ? 'border-tertiary text-tertiary' : 
            'border-primary text-primary'
          }`}>
            STATUS: {status}
          </span>
        )}
        {title && <h3 className="text-primary font-mono uppercase tracking-widest text-sm">{title}</h3>}
      </div>
      {identifier && (
        <span className="text-gray-500 font-mono text-xs hidden sm:block">
          {identifier}
        </span>
      )}
    </div>
  );
};
