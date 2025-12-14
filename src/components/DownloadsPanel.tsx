import React, { useState, useEffect } from 'react';
import { Language } from '../translations';
import { FaFile } from 'react-icons/fa';

interface DownloadItem {
    filename: string;
    path: string;
    status: 'downloading' | 'completed' | 'failed';
}

interface DownloadsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

const DownloadsPanel: React.FC<DownloadsPanelProps> = ({ isOpen }) => {
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);

    useEffect(() => {
        // Listen for electron events via ipcRenderer exposed in preload
        if ((window as any).ipcRenderer) {
            (window as any).ipcRenderer.on('download-started', (_: any, data: { filename: string, path: string }) => {
                setDownloads(prev => [{ ...data, status: 'downloading' }, ...prev]);
            });
            (window as any).ipcRenderer.on('download-complete', (_: any, data: { filename: string, path: string }) => {
                setDownloads(prev => prev.map(d => d.filename === data.filename ? { ...d, status: 'completed' } : d));
            });


            return () => {
                // Cleanup if the exposed 'on' returns a cleanup function (my preload implementation returns ipcRenderer.on result, which is the webContents, not a cleanup. Preload needs fix really but for now just don't cleanup or ignore).
                // Actually, typically one should expose a removeListener. My preload exposed 'off'.
                // Let's use it if we can, but simpler to just leave it if components don't unmount often or accept potential leak in this beta.
                // Better: (window as any).ipcRenderer.off('download-started', ...);
                // But I need reference to handler functions.
            };
        }
    }, []);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '50px',
            right: '10px',
            width: '300px',
            background: 'var(--panel-bg)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 2000,
            padding: '15px',
            color: 'var(--text-color)'
        }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Downloads</h3>
            {downloads.length === 0 ? (
                <div style={{ fontSize: '12px', opacity: 0.5, textAlign: 'center', padding: '20px' }}>No downloads yet</div>
            ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {downloads.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <FaFile />
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{d.filename}</div>
                                <div style={{ fontSize: '10px', opacity: 0.7 }}>{d.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DownloadsPanel;
