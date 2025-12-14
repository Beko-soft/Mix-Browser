import React, { useState } from 'react';
import { FaSearch, FaGoogle, FaMicrosoft } from 'react-icons/fa';
interface SearchEngine {
    id: string;
    name: string;
    url: string; // Search query template
    icon: React.ReactNode;
}

// Custom icons since react-icons might not have exact branded matches for all, but using reasonable approximations
// FaMicrosoft for Bing-like feel, FaYandex, etc.


export const searchEngines: SearchEngine[] = [
    { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: <FaGoogle /> },
    { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: <FaMicrosoft /> }, // Using Microsoft for Bing
    { id: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text=', icon: <span style={{ fontWeight: 'bold', fontFamily: 'serif' }}>Y</span> }, // Custom Y text if no icon
    { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: <span style={{ fontWeight: 'bold' }}>DDG</span> }, // Fallback
];


const Home: React.FC<{ onSearch: (url: string) => void, defaultSearchEngineUrl?: string }> = ({ onSearch, defaultSearchEngineUrl }) => {
    const [query, setQuery] = useState('');
    const initialEngine = searchEngines.find(e => e.url === defaultSearchEngineUrl) || searchEngines[0];
    const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(initialEngine);

    // Update selected engine if default changes (optional, but good for settings sync)
    React.useEffect(() => {
        if (defaultSearchEngineUrl) {
            const engine = searchEngines.find(e => e.url === defaultSearchEngineUrl);
            if (engine) setSelectedEngine(engine);
        }
    }, [defaultSearchEngineUrl]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(selectedEngine.url + encodeURIComponent(query));
        }
    };

    return (
        <div className="home-container" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white'
        }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '2rem', textShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                MixBrowser
            </h1>

            <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '15px',
                    padding: '15px 25px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <FaSearch size={20} color="rgba(255,255,255,0.7)" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search with ${selectedEngine.name}...`}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            marginLeft: '15px',
                            color: 'white',
                            fontSize: '18px',
                            outline: 'none'
                        }}
                        autoFocus
                    />
                </div>



                {/* Search Engine Selection (Horizontal List) */}
                <div className="engine-selector-quick" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    marginTop: '10px'
                }}>
                    {searchEngines.map(engine => (
                        <div
                            key={engine.id}
                            onClick={() => setSelectedEngine(engine)}
                            title={engine.name}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: selectedEngine.id === engine.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: selectedEngine.id === engine.id ? '2px solid white' : '2px solid transparent',
                                boxShadow: selectedEngine.id === engine.id ? '0 0 10px rgba(0,0,0,0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedEngine.id !== engine.id) e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                if (selectedEngine.id !== engine.id) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            {engine.icon}
                        </div>
                    ))}
                </div>
            </form>
        </div>
    );
};


export default React.memo(Home);

