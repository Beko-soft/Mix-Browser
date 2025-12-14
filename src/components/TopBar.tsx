
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaRedo, FaCog, FaLock, FaTerminal, FaDownload, FaUser } from 'react-icons/fa';


interface TopBarProps {
  currentUrl?: string;
  onNavigate: (url: string) => void;
  onToggleSettings: () => void;


  onOpenConsole: () => void;
  onOpenDownloads: () => void;
  onOpenProfile: () => void;
  onBack: () => void;
  onForward: () => void;

  onReload: () => void;
  searchEngineUrl?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  isLoading?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  currentUrl = '',
  onNavigate,

  onToggleSettings,

  onOpenConsole,
  onOpenDownloads,
  onOpenProfile,
  onBack, onForward, onReload,
  searchEngineUrl = 'https://www.google.com/search?q=',
  canGoBack = false,
  canGoForward = false,
  isLoading = false
}) => {
  const [inputVal, setInputVal] = useState(currentUrl);

  useEffect(() => {
    setInputVal(currentUrl);
  }, [currentUrl]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      let url = inputVal.trim();
      if (!url) return;

      // Robust URL detection
      const hasProtocol = /^(http|https|mix):\/\//.test(url);
      // Determine if looks like domain (something.something) or localhost or IP
      const isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/.test(url);
      const isLocalhost = /^localhost(:\d+)?(\/.*)?$/.test(url);
      const isIP = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/.test(url);

      const isUrl = hasProtocol || isDomain || isLocalhost || isIP;

      if (isUrl) {
        if (!hasProtocol) { url = 'https://' + url; }
        onNavigate(url);
      } else {
        // Search
        onNavigate(searchEngineUrl + encodeURIComponent(url));
      }
    }
  };

  return (
    <div className="top-bar">


      {/* Navigation Controls */}
      <div className="nav-controls" style={{ display: 'flex', gap: '8px', marginRight: '15px' }}>
        <button onClick={onBack} title="Back" disabled={!canGoBack} style={{ opacity: canGoBack ? 1 : 0.3, cursor: canGoBack ? 'pointer' : 'default' }}><FaArrowLeft /></button>
        <button onClick={onForward} title="Forward" disabled={!canGoForward} style={{ opacity: canGoForward ? 1 : 0.3, cursor: canGoForward ? 'pointer' : 'default' }}><FaArrowRight /></button>
        <button onClick={onReload} title="Reload"><FaRedo className={isLoading ? 'spin' : ''} /></button>
      </div>

      <div className="spacer" style={{ flex: 1 }}></div>
      <div className="url-bar-container" style={{ flex: 3, maxWidth: '600px', margin: '0 10px' }}>
        <span className="secure-icon"><FaLock color="#4CAF50" /></span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="url-input"
          style={{ textAlign: 'center' }}
          placeholder="Search or enter URL"
        />
      </div>
      <div className="spacer" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <div className="tools-container">

          <button onClick={onOpenDownloads} title="Downloads"><FaDownload /></button>
          <button onClick={onOpenConsole} title="Browser Console"><FaTerminal /></button>

          <button title="Settings" onClick={onToggleSettings}><FaCog /></button>
          <button title="Profile" onClick={onOpenProfile}><FaUser /></button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TopBar);


