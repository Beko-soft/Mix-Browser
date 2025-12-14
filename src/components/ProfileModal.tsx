
import React, { useState } from 'react';
import { useTranslation, Language } from '../translations';
import { FaUser, FaChartBar, FaShieldAlt, FaKey, FaFileExport, FaFileImport, FaEye, FaEyeSlash } from 'react-icons/fa';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    accentColor: string;
}

type Tab = 'passwords' | 'privacy' | 'stats';

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, language, accentColor }) => {
    if (!isOpen) return null;
    const t = useTranslation(language);
    const [activeTab, setActiveTab] = useState<Tab>('passwords');

    const [passwords, setPasswords] = useState<any[]>([]);
    const [showPasswordId, setShowPasswordId] = useState<number | null>(null);

    // Load Passwords
    React.useEffect(() => {
        if (isOpen && activeTab === 'passwords') {
            (window as any).ipcRenderer.invoke('passwords:get-all').then((data: any[]) => {
                setPasswords(data);
            });
        }
    }, [isOpen, activeTab]);

    // Fake Stats Data (Placeholder)
    const [statsEnabled, setStatsEnabled] = useState(true);
    const [stats, setStats] = useState<any[]>([]);

    // Privacy Settings
    const [doNotTrack, setDoNotTrack] = useState(true);
    const [httpsOnly, setHttpsOnly] = useState(false);

    // Initial Data Load
    React.useEffect(() => {
        if (!isOpen) return;

        // Load Settings
        (window as any).ipcRenderer.invoke('settings:get').then((s: any) => {
            setDoNotTrack(s.doNotTrack);
            setHttpsOnly(s.httpsOnly);
            setStatsEnabled(s.statsEnabled);
        });

        // Load specific tab data
        if (activeTab === 'passwords') {
            // Already loading separately below, but ok
        } else if (activeTab === 'stats') {
            (window as any).ipcRenderer.invoke('stats:get').then((s: any) => setStats(s));
        }

    }, [isOpen, activeTab]);

    // Save Settings Helper
    const updateSettings = (key: string, value: any) => {
        // Optimistic UI updates
        if (key === 'doNotTrack') setDoNotTrack(value);
        if (key === 'httpsOnly') setHttpsOnly(value);
        if (key === 'statsEnabled') setStatsEnabled(value);

        (window as any).ipcRenderer.invoke('settings:save', { [key]: value });
    };



    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            // Simple CSV Parse
            const lines = text.split('\n');
            let count = 0;
            for (let i = 1; i < lines.length; i++) {
                const [url, username, password] = lines[i].split(',');
                if (url && username && password) {
                    await (window as any).ipcRenderer.invoke('passwords:save', {
                        url: url.trim(),
                        username: username.trim(),
                        password: password.trim()
                    });
                    count++;
                }
            }
            // Refresh
            const updated = await (window as any).ipcRenderer.invoke('passwords:get-all');
            setPasswords(updated);
            alert(`Imported ${count} passwords!`);
        };
        reader.readAsText(file);
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "URL,Username,Password\n"
            + passwords.map(p => `"${p.url}","${p.username}","${p.password}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "mixbrowser_passwords.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="settings-modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div className="settings-modal" onClick={e => e.stopPropagation()} style={{
                width: '600px',
                maxHeight: '85vh',
                background: '#2a2a30',
                borderRadius: '16px',
                display: 'flex',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white'
            }}>
                {/* Sidebar */}
                <div style={{ width: '200px', background: 'rgba(0,0,0,0.2)', padding: '20px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaUser /> {t('profile')}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button
                            onClick={() => setActiveTab('passwords')}
                            style={{
                                textAlign: 'left', padding: '10px', borderRadius: '8px', border: 'none',
                                background: activeTab === 'passwords' ? accentColor : 'transparent',
                                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                            <FaKey /> {t('passwords')}
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            style={{
                                textAlign: 'left', padding: '10px', borderRadius: '8px', border: 'none',
                                background: activeTab === 'privacy' ? accentColor : 'transparent',
                                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                            <FaShieldAlt /> {t('privacy')}
                        </button>
                        <button
                            onClick={() => setActiveTab('stats')}
                            style={{
                                textAlign: 'left', padding: '10px', borderRadius: '8px', border: 'none',
                                background: activeTab === 'stats' ? accentColor : 'transparent',
                                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                            <FaChartBar /> {t('stats')}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>×</button>
                    </div>

                    {activeTab === 'passwords' && (
                        <div>
                            <h2 style={{ marginTop: 0 }}>{t('passwords')}</h2>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <label style={{ background: accentColor, padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FaFileImport /> {t('importCsv')}
                                    <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
                                </label>
                                <button onClick={handleExport} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FaFileExport /> {t('exportCsv')}
                                </button>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                                {passwords.map(p => (
                                    <div key={p.id} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.url}</div>
                                            <div style={{ fontSize: '12px', opacity: 0.7 }}>{p.username}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: '4px' }}>
                                                {showPasswordId === p.id ? p.password : '••••••••'}
                                            </div>
                                            <button onClick={() => setShowPasswordId(showPasswordId === p.id ? null : p.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7 }}>
                                                {showPasswordId === p.id ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div>
                            <h2 style={{ marginTop: 0 }}>{t('privacy')}</h2>

                            <div className="setting-item" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{t('doNotTrack')}</div>
                                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Ask websites not to track your activity</div>
                                </div>
                                <input type="checkbox" checked={doNotTrack} onChange={e => updateSettings('doNotTrack', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: accentColor }} />
                            </div>

                            <div className="setting-item" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>HTTPS Only</div>
                                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Force secure connections</div>
                                </div>
                                <input type="checkbox" checked={httpsOnly} onChange={e => updateSettings('httpsOnly', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: accentColor }} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div>
                            <h2 style={{ marginTop: 0 }}>{t('stats')}</h2>
                            <div className="setting-item" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" checked={statsEnabled} onChange={e => updateSettings('statsEnabled', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: accentColor }} />
                                <label>{t('recordStats')}</label>
                            </div>

                            {statsEnabled ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {stats.map(s => (
                                        <div key={s.domain} style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: '500' }}>{s.domain}</span>
                                            <div style={{ display: 'flex', gap: '20px', fontSize: '13px', opacity: 0.8 }}>
                                                <span>{s.visits} visits</span>
                                                <span>{s.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                                    <FaEyeSlash size={40} />
                                    <p>{t('statsDisabled')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
