import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { PreviewSection } from './components/PreviewSection';
import { AiAssistant } from './components/AiAssistant';
import type { PluginConfig } from './types';
import { DEFAULT_CONFIG } from './generator/constants';
import { generatePluginFiles } from './generator';
import './styles/main.scss';
import 'prismjs/themes/prism.css';

const App: React.FC = () => {
  const [config, setConfig] = useState<PluginConfig>(DEFAULT_CONFIG);
  const [files, setFiles] = useState(generatePluginFiles(DEFAULT_CONFIG));
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    setFiles(generatePluginFiles(config));
  }, [config]);

  return (
    <div className="app-container">
      <InputSection config={config} onChange={setConfig} />
      <PreviewSection files={files} />

      <AiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        files={files}
        config={config}
      />

      {!isAiOpen && (
        <button
          className="ai-toggle-btn"
          onClick={() => setIsAiOpen(true)}
          title="Open Arki AI"
        >
          ✨ Ask Arki
        </button>
      )}
    </div>
  );
};

export default App;
