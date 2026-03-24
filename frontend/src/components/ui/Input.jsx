import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, className = '', containerClassName = '', error, ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-2 group/input ${containerClassName}`}>
      {label && (
        <label className="text-gray-400 uppercase tracking-widest text-xs font-mono group-focus-within/input:text-primary transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full bg-surface-container-lowest text-primary font-mono text-sm p-3 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(0,255,194,0.3)] focus:bg-surface-container-low focus:ring-1 focus:ring-primary placeholder:text-gray-700 ${
            error ? 'border-b-2 border-tertiary focus:shadow-[0_0_15px_rgba(255,107,107,0.3)] focus:ring-tertiary' : ''
          } ${className}`}
          {...props}
        />
        {/* Perforation effect on left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-evenly pl-[2px] pointer-events-none opacity-40 group-focus-within/input:opacity-80 transition-opacity">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full transition-colors ${error ? 'bg-tertiary' : 'bg-primary'}`} />
          ))}
        </div>
      </div>
      {error && <span className="text-tertiary font-mono text-xs animate-scan-in">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
