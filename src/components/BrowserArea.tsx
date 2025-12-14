

import React, { useRef, useEffect, useState } from 'react';
import Home from './Home';
import { FaSpinner } from 'react-icons/fa';
import { Tab } from './Sidebar';
import ContextMenu from './ContextMenu';

interface BrowserAreaProps {
    tabs: Tab[];
    activeTabId: number;
    navAction: { type: 'BACK' | 'FORWARD' | 'RELOAD' | 'STOP', id: number } | null;


    onUpdateTabTitle: (id: number, title: string) => void;
    onNavigate: (url: string) => void;
    searchEngineUrl?: string;
    onUpdateNavState: (id: number, state: { canGoBack: boolean; canGoForward: boolean; isLoading: boolean }) => void;
}

const BrowserArea: React.FC<BrowserAreaProps> = ({
    tabs,
    activeTabId,
    navAction,
    onUpdateTabTitle,
    onNavigate,
    searchEngineUrl,
    onUpdateNavState
}) => {
    // We keep a registry of refs for each tab's webview
    const webviewRefs = useRef<{ [key: number]: any }>({});
    const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        tabId?: number;
    }>({ visible: false, x: 0, y: 0 });

    // Notify App about nav state when active tab changes
    useEffect(() => {
        const wv = webviewRefs.current[activeTabId];
        if (wv) {
            // If webview exists, getting immediate state is hard without async, but key events will trigger updates.
            // We can optimistically push current loading state.
            const canBack = wv.canGoBack();
            const canFwd = wv.canGoForward();
            onUpdateNavState(activeTabId, { canGoBack: canBack, canGoForward: canFwd, isLoading: loadingStates[activeTabId] || false });
        } else {
            // Home or empty
            onUpdateNavState(activeTabId, { canGoBack: false, canGoForward: false, isLoading: false });
        }
    }, [activeTabId, loadingStates]);

    // Handle Navigation Actions (Back, Forward, Reload)
    useEffect(() => {
        if (navAction && webviewRefs.current[navAction.id]) {
            const element = webviewRefs.current[navAction.id];
            try {
                if (navAction.type === 'BACK' && element.canGoBack()) element.goBack();
                if (navAction.type === 'FORWARD' && element.canGoForward()) element.goForward();
                if (navAction.type === 'RELOAD') element.reload();
                if (navAction.type === 'DEV_TOOLS' as any) {
                    if (element.isDevToolsOpened()) {
                        element.closeDevTools();
                    } else {

                        element.openDevTools({ mode: 'right' });
                    }
                }
            } catch (e) {
                console.error("Nav Error:", e);
            }
        }
    }, [navAction]);

    const handleWebviewMount = (id: number, element: any) => {
        if (element) {
            webviewRefs.current[id] = element;

            // Helper to push state
            const updateState = (loading: boolean) => {
                try {
                    const canBack = element.canGoBack();
                    const canFwd = element.canGoForward();
                    onUpdateNavState(id, { canGoBack: canBack, canGoForward: canFwd, isLoading: loading });
                } catch (e) { }
            };

            // Setup Listeners
            const startLoad = () => {
                setLoadingStates(prev => ({ ...prev, [id]: true }));
                updateState(true);
            };
            const stopLoad = () => {
                setLoadingStates(prev => ({ ...prev, [id]: false }));
                onUpdateTabTitle(id, element.getTitle());
                updateState(false);
            };

            const navUpdate = () => {
                // Navigation state might change without loading start/stop (e.g. hash change)
                if (!loadingStates[id]) updateState(false);
            };

            element.addEventListener('did-start-loading', startLoad);
            element.addEventListener('did-stop-loading', stopLoad);
            element.addEventListener('did-navigate', navUpdate);
            element.addEventListener('did-navigate-in-page', navUpdate);


            // Context Menu Logic
            element.addEventListener('context-menu', (e: any) => {
                // e.params has x, y from the webview content
                // We need to map it to our screen. 
                // However, e.params.x/y are relative to webview. The webview is full screen in browser-area.
                // We just need the offset of the browser area, but browser area is mainly full screen except sidebar/topbar.

                // Keep it simple: use the client coordinates provided by event if possible, or basic calculation.
                // In Electron webview, 'context-menu' event arg contains 'params'
                // params: { x, y, ... }

                // We'll trust params.x and params.y but add TopBar height offset if needed? 
                // Actually 'context-menu' from webview is unpredictable with coordinates relative to what. 
                // Usually it's client coordinates of the webview.

                // Let's assume params.x/y are correct for the viewport of the webview.
                // We need to add Sidebar Width & TopBar Height?
                // Sidebar: 60px (var(--sidebar-width)), TopBar: 50px (var(--topbar-height))
                // But Sidebar is absolute/fixed on left? Yes.

                const sidebarWidth = 60;
                const topBarHeight = 50;

                const { x, y } = e.params || { x: 0, y: 0 };

                setContextMenu({
                    visible: true,
                    x: x + sidebarWidth, // Adjust for layout
                    y: y + topBarHeight,
                    tabId: id
                });
            });
        }
    };

    return (
        <div className="browser-area">
            {tabs.map(tab => {
                const isActive = tab.id === activeTabId;
                const isHome = tab.url === 'mix://home' || !tab.url;
                const isLoading = loadingStates[tab.id];

                return (
                    <div
                        key={tab.id}
                        style={{
                            display: isActive ? 'flex' : 'none',
                            flex: 1,
                            width: '100%',
                            height: '100%',
                            position: 'relative'
                        }}
                    >
                        {isHome ? (
                            <Home onSearch={onNavigate} defaultSearchEngineUrl={searchEngineUrl} />
                        ) : (
                            <>
                                {isLoading && isActive && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 0,
                                        pointerEvents: 'none'
                                    }}>
                                        <FaSpinner className="spin" size={40} color="var(--accent-color)" />
                                    </div>
                                )}
                                {/* @ts-ignore */}
                                <webview
                                    ref={(el: any) => handleWebviewMount(tab.id, el)}
                                    src={tab.url}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        background: 'white',
                                        display: isActive ? 'flex' : 'none' // Redundant but safe
                                    }}
                                    allowpopups={true as any}
                                    partition="persist:mixbrowser"
                                />
                            </>
                        )}
                    </div>
                );

            })}

            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu({ ...contextMenu, visible: false })}
                    canGoBack={(() => {
                        try { return webviewRefs.current[contextMenu.tabId!]?.canGoBack(); } catch { return false; }
                    })()}
                    canGoForward={(() => {
                        try { return webviewRefs.current[contextMenu.tabId!]?.canGoForward(); } catch { return false; }
                    })()}
                    onBack={() => { try { webviewRefs.current[contextMenu.tabId!]?.goBack(); } catch { } }}
                    onForward={() => { try { webviewRefs.current[contextMenu.tabId!]?.goForward(); } catch { } }}
                    onReload={() => { try { webviewRefs.current[contextMenu.tabId!]?.reload(); } catch { } }}

                    onInspect={() => { try { webviewRefs.current[contextMenu.tabId!]?.openDevTools({ mode: 'right' }); } catch { } }}
                    onCopy={() => { try { webviewRefs.current[contextMenu.tabId!]?.copy(); } catch { } }}
                    onPaste={() => { try { webviewRefs.current[contextMenu.tabId!]?.paste(); } catch { } }}
                />
            )}
        </div>
    );
};

export default React.memo(BrowserArea);
