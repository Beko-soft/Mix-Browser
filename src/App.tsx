


import React, { useState, useEffect, Suspense } from 'react';
import Sidebar, { Tab } from './components/Sidebar';
import TopBar from './components/TopBar';
import BrowserArea from './components/BrowserArea';
import SearchOverlay from './components/SearchOverlay';
import BackgroundManager from './components/BackgroundManager';
import { FaHome } from 'react-icons/fa';


const SettingsModal = React.lazy(() => import('./components/SettingsModal'));
const DownloadsPanel = React.lazy(() => import('./components/DownloadsPanel'));
const ProfileModal = React.lazy(() => import('./components/ProfileModal'));


const App: React.FC = () => {

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Tab State - Start with Home
  const [tabs, setTabs] = useState<Tab[]>([
    { id: Date.now(), title: 'Home', url: 'mix://home', icon: <FaHome /> }
  ]);
  const [activeTabId, setActiveTabId] = useState<number>(tabs[0].id);


  // Nav Action State (trigger signal for BrowserArea)
  const [navAction, setNavAction] = useState<{ type: 'BACK' | 'FORWARD' | 'RELOAD' | 'STOP', id: number } | null>(null);

  // Active Tab Navigation State (for UI buttons)
  const [navState, setNavState] = useState<{ canGoBack: boolean; canGoForward: boolean; isLoading: boolean }>({
    canGoBack: false,
    canGoForward: false,
    isLoading: false
  });

  // Personalization State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [blurLevel, setBlurLevel] = useState<number>(10);

  const [accentColor, setAccentColor] = useState<string>('#ec4899');
  const [borderRadius, setBorderRadius] = useState<number>(12);


  const [customWallpaper, setCustomWallpaper] = useState<string>('./wallpaper.png');
  const [searchEngineUrl, setSearchEngineUrl] = useState<string>('https://www.google.com/search?q=');
  const [language, setLanguage] = useState<'en' | 'tr'>('tr');


  const [shortcuts, setShortcuts] = useState<{ id: string, label: string, keys: string }[]>([
    { id: 'new-tab', label: 'New Tab', keys: 'Ctrl+t' },
    { id: 'close-tab', label: 'Close Tab', keys: 'Ctrl+w' },
    { id: 'reload', label: 'Reload Page', keys: 'Ctrl+r' },
    { id: 'focus-url', label: 'Focus URL Bar', keys: 'Ctrl+l' },
    { id: 'go-back', label: 'Go Back', keys: 'Alt+ArrowLeft' },
    { id: 'go-forward', label: 'Go Forward', keys: 'Alt+ArrowRight' },
  ]);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);



  // -- Tab Management --
  const handleAddTab = () => {
    const newTab = { id: Date.now(), title: 'New Tab', url: 'mix://home', icon: <FaHome /> };
    setTabs(prev => [...prev, newTab]); // Use functional update
    setActiveTabId(newTab.id);
  };

  const handleRemoveTab = (id: number) => {
    // Logic from before, slightly safer accessing current tabs
    setTabs(currentTabs => {
      const newTabs = currentTabs.filter(t => t.id !== id);
      if (newTabs.length === 0) {
        const homeTab = { id: Date.now(), title: 'Home', url: 'mix://home', icon: <FaHome /> };
        setActiveTabId(homeTab.id);
        return [homeTab];
      }
      if (activeTabId === id) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  };

  const handleActivateTab = (id: number) => {
    setActiveTabId(id);
  };

  const handleUpdateTabTitle = (id: number, title: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, title } : t));
  };


  // -- Navigation --
  const handleNavigate = (url: string) => {
    // Standard Browser Behavior: Navigate CURRENT tab
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, url: url, title: 'Loading...' } : t));
    setIsSearchOpen(false);

    // Record Stats
    try {
      if (!url.startsWith('mix://')) {
        const domain = new URL(url).hostname;
        (window as any).ipcRenderer?.invoke('stats:record', { domain });
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  };

  const triggerNavAction = (type: 'BACK' | 'FORWARD' | 'RELOAD' | 'STOP') => {
    setNavAction({ type, id: activeTabId });
    // Reset after short delay to allow re-trigger need be? 
    // Actually object identity change is enough for useEffect, but we need unique objects.
    setTimeout(() => setNavAction(null), 100);
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Dynamic Styles
  const appStyle: React.CSSProperties = {
    '--bg-blur': `${blurLevel}px`,
    '--text-color': theme === 'dark' ? 'white' : '#333',
    '--panel-bg': theme === 'dark' ? 'rgba(40, 44, 52, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    '--accent-color': accentColor,

    '--border-radius': `${borderRadius}px`
  } as React.CSSProperties;

  // -- Shortcuts Listener --
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pressedKeys = [];
      if (e.ctrlKey) pressedKeys.push('Ctrl');
      if (e.altKey) pressedKeys.push('Alt');
      if (e.shiftKey) pressedKeys.push('Shift');
      if (e.metaKey) pressedKeys.push('Meta');

      // Normalize key names somewhat
      let key = e.key;
      if (key === 'Control' || key === 'Alt' || key === 'Shift' || key === 'Meta') return;
      if (key === ' ') key = 'Space';

      pressedKeys.push(key);
      const combo = pressedKeys.join('+').toLowerCase(); // simple comparison

      const matched = shortcuts.find(s => s.keys.toLowerCase() === combo);

      if (matched) {
        e.preventDefault();

        switch (matched.id) {
          case 'new-tab': handleAddTab(); break;
          case 'close-tab': handleRemoveTab(activeTabId); break;
          case 'reload': triggerNavAction('RELOAD'); break;
          case 'focus-url':
            const urlInput = document.querySelector('.url-input') as HTMLInputElement;
            if (urlInput) urlInput.focus();
            else toggleSearch();
            break;
          case 'go-back': triggerNavAction('BACK'); break;
          case 'go-forward': triggerNavAction('FORWARD'); break;
          case 'dev-tools':
            // Toggle DevTools for active tab
            // We can't directly access webview ref here comfortably without context or ref lifting.
            // Simpler approach: trigger a "DEV_TOOLS" action similarly to navAction
            triggerNavAction('DEV_TOOLS' as any);
            break;
        }
      }

      // Global F12 check
      if (e.key === 'F12') {
        triggerNavAction('DEV_TOOLS' as any);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, activeTabId, handleAddTab, handleRemoveTab, triggerNavAction, toggleSearch]);

  // -- Advanced Tab Management Actions --
  const handleTogglePin = (id: number) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
  };

  const handleCloseOthers = (id: number) => {
    setTabs(prev => {
      const keep = prev.find(t => t.id === id);
      if (!keep) return prev;
      // Keep the target tab and any pinned tabs? usually "Close Others" implies unpinned ones.
      // Let's keep pinned tabs safe too.
      return prev.filter(t => t.id === id || t.pinned);
    });
    setActiveTabId(id);
  };

  const handleDuplicate = (id: number) => {
    const tab = tabs.find(t => t.id === id);
    if (tab) {
      const newTab = { ...tab, id: Date.now(), title: tab.title };
      // Note: webview state won't be copied, just URL.
      setTabs(prev => {
        const idx = prev.findIndex(t => t.id === id);
        const newTabs = [...prev];
        newTabs.splice(idx + 1, 0, newTab);
        return newTabs;
      });
    }
  };

  return (
    <div className={`app-container ${theme}`} style={appStyle}>
      <BackgroundManager accentColor={accentColor} customWallpaper={customWallpaper} />
      <Suspense fallback={null}>
        <DownloadsPanel isOpen={isDownloadsOpen} onClose={() => setIsDownloadsOpen(false)} language={language} />
        <Sidebar
          tabs={tabs}
          activeTabId={activeTabId}
          onAddTab={handleAddTab}
          onRemoveTab={handleRemoveTab}
          onActivateTab={handleActivateTab}
          onToggleSearch={toggleSearch}
          onTogglePin={handleTogglePin}
          onCloseOthers={handleCloseOthers}
          onDuplicate={handleDuplicate}
          language={language}
        />
        <div className="main-content">

          <TopBar

            currentUrl={activeTab?.url === 'mix://home' ? '' : activeTab?.url}
            onNavigate={handleNavigate}


            onToggleSettings={toggleSettings}
            onOpenConsole={() => triggerNavAction('DEV_TOOLS' as any)}
            onOpenDownloads={() => setIsDownloadsOpen(!isDownloadsOpen)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onBack={() => triggerNavAction('BACK')}
            onForward={() => triggerNavAction('FORWARD')}
            onReload={() => triggerNavAction('RELOAD')}
            searchEngineUrl={searchEngineUrl}
            canGoBack={navState.canGoBack}
            canGoForward={navState.canGoForward}
            isLoading={navState.isLoading}
          />

          <BrowserArea
            tabs={tabs}
            activeTabId={activeTabId}
            navAction={navAction}
            onUpdateTabTitle={handleUpdateTabTitle}
            onNavigate={handleNavigate}
            searchEngineUrl={searchEngineUrl}
            onUpdateNavState={(id, state) => {
              if (id === activeTabId) {
                setNavState(prev => ({ ...prev, ...state }));
              }
            }}
          />
        </div>

        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={(url) => {
            // New Tab for Overlay Search
            const newTab = { id: Date.now(), title: 'Search', url };
            setTabs(prev => [...prev, newTab]);
            setActiveTabId(newTab.id);
            setIsSearchOpen(false);
          }}
          language={language}
          defaultSearchEngineUrl={searchEngineUrl}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          blurLevel={blurLevel}
          setBlurLevel={setBlurLevel}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          borderRadius={borderRadius}
          setBorderRadius={setBorderRadius}
          shortcuts={shortcuts}

          setShortcuts={setShortcuts}

          customWallpaper={customWallpaper}
          setCustomWallpaper={setCustomWallpaper}
          searchEngineUrl={searchEngineUrl}
          setSearchEngineUrl={setSearchEngineUrl}
          language={language}
          setLanguage={setLanguage}
        />
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          language={language}
          accentColor={accentColor}
        />
      </Suspense>
    </div >
  );
};


export default App;
