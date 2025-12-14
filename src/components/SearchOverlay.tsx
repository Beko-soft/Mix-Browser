
import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { searchEngines } from './Home';
import { useTranslation, Language } from '../translations';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (url: string) => void;
    language: Language;
    defaultSearchEngineUrl: string;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
    isOpen, onClose, onNavigate, language, defaultSearchEngineUrl
}) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const t = useTranslation(language);

    // Local state for search engine selection within the overlay
    const [activeEngineUrl, setActiveEngineUrl] = useState(defaultSearchEngineUrl);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            // Sync with global default when opening
            setActiveEngineUrl(defaultSearchEngineUrl);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, defaultSearchEngineUrl]);

    const activeEngine = searchEngines.find(e => e.url === activeEngineUrl) || searchEngines[0];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            if (activeEngineUrl) {
                onNavigate(activeEngineUrl + encodeURIComponent(query));
            } else {
                // Fallback
                onNavigate('https://google.com/search?q=' + encodeURIComponent(query));
            }
            onClose();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="search-overlay-backdrop" onClick={onClose} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '15vh',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(15px)',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div className="search-box-container" onClick={e => e.stopPropagation()} style={{
                width: '650px',
                background: 'rgba(30, 30, 35, 0.95)',
                padding: '0',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideDown 0.2s ease-out'
            }}>
                {/* Header / Input Area */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '20px 25px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <FaSearch size={22} color="var(--accent-color)" style={{ marginRight: '15px' }} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t('searchPlaceholder', { engine: activeEngine.name })}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '22px',
                            fontWeight: '500',
                            outline: 'none',
                            fontFamily: 'Inter, sans-serif'
                        }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'rgba(255,255,255,0.5)',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}>ESC</button>
                </div>

                {/* Quick Engine Selector */}
                <div style={{
                    padding: '15px 25px',
                    background: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginRight: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Search With:
                    </span>
                    {searchEngines.map(engine => (
                        <div
                            key={engine.id}
                            onClick={() => setActiveEngineUrl(engine.url)}
                            title={engine.name}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                background: activeEngineUrl === engine.url ? 'rgba(255,255,255,0.15)' : 'transparent',
                                border: activeEngineUrl === engine.url ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.1s',
                                fontSize: '13px',
                                color: activeEngineUrl === engine.url ? 'white' : 'rgba(255,255,255,0.6)'
                            }}
                        >
                            <span style={{ display: 'flex' }}>{engine.icon}</span>
                            <span>{engine.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default SearchOverlay;
