
import React, { useState, useMemo } from 'react';
import { FaPlus, FaTimes, FaSearch, FaGlobe, FaThumbtack } from 'react-icons/fa';
import TabContextMenu from './TabContextMenu';
import { Language } from '../translations';

export interface Tab {
    id: number;
    title: string;
    url: string;
    icon?: React.ReactNode;
    pinned?: boolean;
}

interface SidebarProps {
    tabs: Tab[];
    activeTabId: number;
    onAddTab: () => void;
    onRemoveTab: (id: number) => void;
    onActivateTab: (id: number) => void;
    onToggleSearch: () => void;
    onTogglePin: (id: number) => void;
    onCloseOthers: (id: number) => void;
    onDuplicate: (id: number) => void;
    language: Language;
}

// Memoized Tab Item for Performance
const TabItem: React.FC<{
    tab: Tab;
    isActive: boolean;
    onActivate: (id: number) => void;
    onRemove: (id: number) => void;
    onContextMenu: (e: React.MouseEvent, id: number) => void;
}> = React.memo(({ tab, isActive, onActivate, onRemove, onContextMenu }) => {
    return (
        <div
            className={`tab ${isActive ? 'active' : ''} ${tab.pinned ? 'pinned' : ''} `}
            onClick={() => onActivate(tab.id)}
            onContextMenu={(e) => onContextMenu(e, tab.id)}
            title={tab.title}
        >
            <div className="tab-icon">
                {tab.pinned ? <FaThumbtack style={{ fontSize: '12px', transform: 'rotate(45deg)' }} /> : (tab.icon || <FaGlobe />)}
            </div>
            {!tab.pinned && (
                <div
                    className="close-tab-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(tab.id);
                    }}
                >
                    <FaTimes />
                </div>
            )}
        </div>
    );
});

const Sidebar: React.FC<SidebarProps> = ({
    tabs,
    activeTabId,
    onAddTab,
    onRemoveTab,
    onActivateTab,
    onToggleSearch,
    onTogglePin,
    onCloseOthers,
    onDuplicate,
    language
}) => {
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        tabId: number;
    } | null>(null);

    const pinnedTabs = useMemo(() => tabs.filter(t => t.pinned), [tabs]);
    const unpinnedTabs = useMemo(() => tabs.filter(t => !t.pinned), [tabs]);

    const handleContextMenu = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            tabId: id
        });
    };

    return (
        <div className="sidebar">
            {/* Search / Command Palette Trigger */}
            <div className="sidebar-action-icon" onClick={onToggleSearch} title="Search / Open URL">
                <FaSearch />
            </div>

            <div className="tab-list">
                {/* Pinned Tabs Section */}
                {pinnedTabs.length > 0 && (
                    <div className="pinned-tabs-container">
                        {pinnedTabs.map(tab => (
                            <TabItem
                                key={tab.id}
                                tab={tab}
                                isActive={tab.id === activeTabId}
                                onActivate={onActivateTab}
                                onRemove={onRemoveTab}
                                onContextMenu={handleContextMenu}
                            />
                        ))}
                        <div className="tab-divider" />
                    </div>
                )}

                {/* Normal Tabs */}
                {unpinnedTabs.map(tab => (
                    <TabItem
                        key={tab.id}
                        tab={tab}
                        isActive={tab.id === activeTabId}
                        onActivate={onActivateTab}
                        onRemove={onRemoveTab}
                        onContextMenu={handleContextMenu}
                    />
                ))}
            </div>

            {/* Add Tab Button */}
            <div className="add-tab-button" onClick={onAddTab} title="New Tab">
                <FaPlus />
            </div>

            {contextMenu && (
                <TabContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    language={language}
                    isPinned={tabs.find(t => t.id === contextMenu.tabId)?.pinned || false}
                    onTogglePin={() => onTogglePin(contextMenu.tabId)}
                    onCloseTab={() => onRemoveTab(contextMenu.tabId)}
                    onCloseOthers={() => onCloseOthers(contextMenu.tabId)}
                    onDuplicate={() => onDuplicate(contextMenu.tabId)}
                />
            )}
        </div>
    );
};


export default React.memo(Sidebar);
