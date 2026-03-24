import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "relative px-6 py-2 uppercase tracking-widest text-sm font-mono overflow-hidden transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold group";
  
  const variants = {
    primary: "bg-primary text-on-primary clip-punch-btn hover:bg-primary-container hover:shadow-[0_0_15px_rgba(0,255,194,0.6)]",
    secondary: "bg-surface-container-highest text-primary hover:text-primary-container hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-outline-variant hover:border-primary",
    success: "bg-secondary text-surface hover:bg-secondary-container clip-punch-btn hover:shadow-[0_0_15px_rgba(186,230,126,0.6)]",
    ghost: "bg-transparent text-gray-400 hover:text-primary hover:bg-surface-container hover:shadow-[inset_0_0_10px_rgba(0,255,194,0.2)]",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {/* Glint effect on hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-glint z-0" />
    </button>
  );
};
