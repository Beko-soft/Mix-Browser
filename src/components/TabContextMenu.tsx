
import React, { useEffect, useRef } from 'react';
import { useTranslation, Language } from '../translations';

interface TabContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    language: Language;
    isPinned: boolean;
    onTogglePin: () => void;
    onCloseTab: () => void;
    onCloseOthers: () => void;
    onDuplicate: () => void;
}

const TabContextMenu: React.FC<TabContextMenuProps> = ({
    x,
    y,
    onClose,
    language,
    isPinned,
    onTogglePin,
    onCloseTab,
    onCloseOthers,
    onDuplicate
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const t = useTranslation(language);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        window.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', onClose);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', onClose);
        };
    }, [onClose]);

    const style: React.CSSProperties = {
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 10000,
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        padding: '5px 0',
        minWidth: '160px',
        color: 'var(--text-color)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.1s ease-out'
    };

    const itemStyle: React.CSSProperties = {
        padding: '8px 15px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        transition: 'background 0.2s',
        userSelect: 'none'
    };

    const separatorStyle: React.CSSProperties = {
        height: '1px',
        background: 'rgba(255,255,255,0.1)',
        margin: '4px 0'
    }

    const HoverItem = (props: React.HTMLAttributes<HTMLDivElement>) => (
        <div
            {...props}
            className="context-menu-item"
            style={itemStyle}
        />
    );

    return (
        <div ref={menuRef} style={style}>
            <HoverItem onClick={() => { onTogglePin(); onClose(); }}>
                {isPinned ? t('unpinTab', { defaultValue: 'Unpin Tab' }) : t('pinTab', { defaultValue: 'Pin Tab' })}
            </HoverItem>
            <HoverItem onClick={() => { onDuplicate(); onClose(); }}>
                {t('duplicateTab', { defaultValue: 'Duplicate Tab' })}
            </HoverItem>
            <div style={separatorStyle} />
            <HoverItem onClick={() => { onCloseTab(); onClose(); }}>
                {t('closeTab')}
            </HoverItem>
            <HoverItem onClick={() => { onCloseOthers(); onClose(); }}>
                {t('closeOtherTabs', { defaultValue: 'Close Others' })}
            </HoverItem>
        </div>
    );
};

export default TabContextMenu;
