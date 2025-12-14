
import React from 'react';




import { searchEngines } from './Home';
import { useTranslation, Language } from '../translations';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: 'dark' | 'light';
    setTheme: (theme: 'dark' | 'light') => void;
    blurLevel: number;
    setBlurLevel: (level: number) => void;
    accentColor: string;
    setAccentColor: (color: string) => void;
    borderRadius: number;
    setBorderRadius: (radius: number) => void;
    shortcuts: { id: string, label: string, keys: string }[];
    setShortcuts: (shortcuts: { id: string, label: string, keys: string }[]) => void;
    customWallpaper: string;
    setCustomWallpaper: (url: string) => void;

    searchEngineUrl: string;
    setSearchEngineUrl: (url: string) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}


const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, theme, setTheme, blurLevel, setBlurLevel,
    accentColor, setAccentColor, borderRadius, setBorderRadius,
    shortcuts, setShortcuts, customWallpaper, setCustomWallpaper,
    searchEngineUrl, setSearchEngineUrl, language, setLanguage
}) => {
    if (!isOpen) return null;

    const t = useTranslation(language);

    const handleShortcutChange = (id: string, newKeys: string) => {
        setShortcuts(shortcuts.map(s => s.id === id ? { ...s, keys: newKeys } : s));
    };


    return (
        <div className="settings-modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div className="settings-modal" onClick={e => e.stopPropagation()} style={{
                width: '500px',
                maxHeight: '85vh',
                overflowY: 'auto',
                background: '#2a2a30',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white'
            }}>
                <h2 style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                    {t('settings')}
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
                </h2>

                <div className="settings-section">
                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '15px' }}>{t('appearance')}</h3>

                    {/* Language */}
                    <div className="setting-item" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('language')}</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setLanguage('en')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: language === 'en' ? accentColor : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>{t('english')}</button>
                            <button onClick={() => setLanguage('tr')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: language === 'tr' ? accentColor : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>{t('turkish')}</button>
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="setting-item" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('theme')}</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setTheme('dark')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: theme === 'dark' ? accentColor : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>{t('dark')}</button>
                            <button onClick={() => setTheme('light')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: theme === 'light' ? accentColor : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>{t('light')}</button>
                        </div>
                    </div>


                    {/* Accent Color (Themes) */}
                    <div className="setting-item" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('accentColor')}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {[
                                { name: t('themePink'), color: '#ec4899' },
                                { name: t('themeRed'), color: '#ef4444' },
                                { name: t('themeBlue'), color: '#3b82f6' },
                                { name: t('themeGreen'), color: '#10b981' },
                            ].map(theme => (
                                <div
                                    key={theme.color}
                                    onClick={() => setAccentColor(theme.color)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: accentColor === theme.color ? theme.color : 'rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',

                                        border: accentColor === theme.color ? '1px solid white' : '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={() => setCustomWallpaper('')} // Clear wallpaper preview if any
                                >
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: theme.color }} />
                                    <span style={{ fontSize: '13px', fontWeight: accentColor === theme.color ? 'bold' : 'normal' }}>{theme.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Wallpaper */}
                    <div className="setting-item" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('wallpaper')}</label>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <input
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                value={customWallpaper}
                                onChange={(e) => setCustomWallpaper(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '12px', opacity: 0.7 }}>{t('orLocal')}</span>
                                <label style={{
                                    padding: '8px 12px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    display: 'inline-block'
                                }}>
                                    {t('browseFiles')}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setCustomWallpaper(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Blur */}
                    <div className="setting-item" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '500' }}>
                            <span>{t('translucency')}</span> <span>{blurLevel}px</span>
                        </label>
                        <input type="range" min="0" max="40" value={blurLevel} onChange={(e) => setBlurLevel(Number(e.target.value))} style={{ width: '100%', accentColor: accentColor, height: '4px', borderRadius: '2px' }} />
                    </div>

                    {/* Border Radius */}
                    <div className="setting-item" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '500' }}>
                            <span>{t('roundness')}</span> <span>{borderRadius}px</span>
                        </label>
                        <input type="range" min="0" max="30" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} style={{ width: '100%', accentColor: accentColor, height: '4px', borderRadius: '2px' }} />
                    </div>

                    {/* Search Engine */}
                    <div className="setting-item" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('searchEngine')}</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {searchEngines.map(engine => (
                                <div
                                    key={engine.id}
                                    onClick={() => setSearchEngineUrl(engine.url)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        background: searchEngineUrl === engine.url ? accentColor : 'rgba(255,255,255,0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '14px',
                                        border: searchEngineUrl === engine.url ? '1px solid white' : '1px solid transparent'
                                    }}
                                >
                                    {engine.icon} {engine.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="settings-section" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '15px' }}>{t('shortcuts')}</h3>

                    <div className="shortcuts-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {shortcuts.map(shortcut => (
                            <div key={shortcut.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '14px' }}>{shortcut.label}</span>
                                <input
                                    type="text"
                                    value={shortcut.keys}
                                    onChange={(e) => handleShortcutChange(shortcut.id, e.target.value)}
                                    style={{
                                        width: '100px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: accentColor,
                                        borderRadius: '4px',
                                        padding: '4px 8px',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '12px'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>


                <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '30px' }}>
                    {t('version')}
                </div>
            </div>
        </div>
    );
};


export default SettingsModal;

