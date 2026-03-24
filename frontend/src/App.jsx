import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { ValidatorModule } from './components/ValidatorModule';
import { GeneratorModule } from './components/GeneratorModule';
import { About } from './components/About';
import { ToastProvider } from './components/ui/RetroToast';

function App() {
  const [activeTab, setActiveTab] = useState('GENERATOR');

  return (
    <div className="min-h-screen flex flex-col pt-0 group/app">
      <div className="retro-bg" aria-hidden="true">
        <div className="stars"></div>
        <div className="grid-floor"></div>
        <div className="grid-ceiling" style={{ animationName: 'bg-scroll-ceiling' }}></div>
        <div className="cyber-glow"></div>
      </div>

      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-auto p-8 lg:p-12 z-10 relative">
        <ToastProvider>
          <div className="max-w-7xl mx-auto animate-scan-in app-power-on">
            {activeTab === 'VALIDATOR' && <ValidatorModule />}
            {activeTab === 'GENERATOR' && <GeneratorModule />}
            {activeTab === 'ABOUT' && <About />}
          </div>
        </ToastProvider>
      </main>
    </div>
  );
}

export default App;
