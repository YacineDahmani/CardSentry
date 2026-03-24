import React from 'react';

export const TopNav = ({ activeTab, setActiveTab }) => {
  const tabs = ['GENERATOR', 'VALIDATOR'];

  return (
    <nav className="border-b border-surface-container-high bg-surface flex items-center justify-between px-6 py-4 relative z-10 w-full">
      <div className="flex items-center gap-12">
        {/* Branding */}
        <div className="flex items-center gap-2 text-primary font-display text-xl tracking-tighter shadow-glow-primary">
          CARD_SENTRY
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono text-sm tracking-widest uppercase transition-all pb-1 border-b-2 ${
                activeTab === tab 
                  ? 'text-primary border-primary shadow-glow-primary' 
                  : 'text-gray-500 border-transparent hover:text-gray-300'
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
