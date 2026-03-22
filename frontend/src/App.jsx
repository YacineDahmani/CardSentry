import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { ValidatorModule } from './components/ValidatorModule';
import { GeneratorModule } from './components/GeneratorModule';

function App() {
  const [activeTab, setActiveTab] = useState('VALIDATOR');

  return (
    <div className="min-h-screen flex flex-col pt-0">
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-auto p-8 lg:p-12 z-10 relative">
        <div className="max-w-7xl mx-auto animate-scan-in">
          {activeTab === 'VALIDATOR' && <ValidatorModule />}
          {activeTab === 'GENERATOR' && <GeneratorModule />}
        </div>
      </main>
    </div>
  );
}

export default App;
