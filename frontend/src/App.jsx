import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { ValidatorModule } from './components/ValidatorModule';
import { GeneratorModule } from './components/GeneratorModule';
import { ToastProvider } from './components/ui/RetroToast';

function App() {
  const [activeTab, setActiveTab] = useState('GENERATOR');

  return (
    <div className="min-h-screen flex flex-col pt-0">
      <div className="ambient-bg" aria-hidden="true">
        <span className="ambient-orb ambient-orb-a" />
        <span className="ambient-orb ambient-orb-b" />
        <span className="ambient-grid" />
        <span className="ambient-sweep" />
        <span className="ambient-pulse ambient-pulse-a" />
        <span className="ambient-pulse ambient-pulse-b" />
        <span className="ambient-noise-shift" />
      </div>

      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-auto p-8 lg:p-12 z-10 relative">
        <ToastProvider>
          <div className="max-w-7xl mx-auto animate-scan-in app-power-on">
            {activeTab === 'VALIDATOR' && <ValidatorModule />}
            {activeTab === 'GENERATOR' && <GeneratorModule />}
          </div>
        </ToastProvider>
      </main>
    </div>
  );
}

export default App;
