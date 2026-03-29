import React from 'react';

export const TopNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'GENERATOR', label: 'Card Forge' },
    { key: 'VALIDATOR', label: 'Card Verify' },
    { key: 'FAKE_ADDRESS', label: 'Identity Lab' },
    { key: 'ABOUT', label: 'About' },
  ];

  return (
    <nav className="border-b border-surface-container-high bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 py-4 relative z-10 w-full transition-all duration-300">
      <div className="flex items-center gap-8 lg:gap-12">
        {/* Branding */}
        <div className="flex flex-col leading-none cursor-default select-none">
          <div className="text-primary font-display text-xl tracking-tighter shadow-glow-primary glitch-text hover:scale-105 transition-transform duration-300 origin-left">
              PERSONA_SENTRY
          </div>
          <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-gray-500 mt-1">
            Identity Testing Console
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-5 lg:gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-mono text-sm tracking-widest uppercase transition-all duration-300 pb-1 border-b-2 hover:-translate-y-[1px] ${
                activeTab === tab.key 
                  ? 'text-primary border-primary shadow-glow-primary drop-shadow-[0_0_8px_rgba(0,255,194,0.8)]' 
                  : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
