import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-6 py-2 uppercase tracking-widest text-sm font-mono transition-all duration-75 active:translate-y-[1px] active:translate-x-[1px] disabled:opacity-50 disabled:cursor-not-allowed font-bold";
  
  const variants = {
    primary: "bg-primary text-on-primary clip-punch-btn hover:bg-primary-container",
    secondary: "bg-surface-container-highest text-primary hover:text-primary-container",
    success: "bg-secondary text-surface hover:bg-secondary-container clip-punch-btn",
    ghost: "bg-transparent text-gray-400 hover:text-primary",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
