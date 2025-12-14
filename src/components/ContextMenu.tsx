
import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    canGoBack: boolean;
    canGoForward: boolean;
    onBack: () => void;
    onForward: () => void;
    onReload: () => void;
    onInspect: () => void;
    onCopy: () => void;
    onPaste: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
    x, y, onClose,
    canGoBack, canGoForward,
    onBack, onForward, onReload,
    onInspect, onCopy, onPaste
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

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

    // Adjust position if out of bounds (basic)
    const style: React.CSSProperties = {
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 9999,
        background: 'var(--panel-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        padding: '5px 0',
        minWidth: '180px',
        color: 'var(--text-color)',
        display: 'flex',
        flexDirection: 'column',
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

    const HoverItem = (props: React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }) => {
        return (
            <div
                {...props}
                style={{ ...itemStyle, opacity: props.disabled ? 0.4 : 1, pointerEvents: props.disabled ? 'none' : 'auto' }}
                className="context-menu-item"
            />
        )
    }

    return (
        <div ref={menuRef} style={style} className="context-menu">
            <HoverItem onClick={() => { onBack(); onClose(); }} disabled={!canGoBack}>
                Back
            </HoverItem>
            <HoverItem onClick={() => { onForward(); onClose(); }} disabled={!canGoForward}>
                Forward
            </HoverItem>
            <HoverItem onClick={() => { onReload(); onClose(); }}>
                Reload
            </HoverItem>
            <div style={separatorStyle} />
            {/* Basic Clipboard - Note: These trigger webview methods */}
            <HoverItem onClick={() => { onCopy(); onClose(); }}>
                Copy
            </HoverItem>
            <HoverItem onClick={() => { onPaste(); onClose(); }}>
                Paste
            </HoverItem>
            <div style={separatorStyle} />
            <HoverItem onClick={() => { onInspect(); onClose(); }}>
                Inspect Element
            </HoverItem>
        </div>
    );
};

export default ContextMenu;
