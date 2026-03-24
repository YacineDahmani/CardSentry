import React from 'react';

export const TopNav = ({ activeTab, setActiveTab }) => {
  const tabs = ['GENERATOR', 'VALIDATOR', 'ABOUT'];

  return (
    <nav className="border-b border-surface-container-high bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 py-4 relative z-10 w-full transition-all duration-300">
      <div className="flex items-center gap-12">
        {/* Branding */}
        <div className="flex items-center gap-2 text-primary font-display text-xl tracking-tighter shadow-glow-primary glitch-text cursor-default select-none hover:scale-105 transition-transform duration-300">
          CARD_SENTRY
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono text-sm tracking-widest uppercase transition-all duration-300 pb-1 border-b-2 hover:-translate-y-[1px] ${
                activeTab === tab 
                  ? 'text-primary border-primary shadow-glow-primary drop-shadow-[0_0_8px_rgba(0,255,194,0.8)]' 
                  : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
