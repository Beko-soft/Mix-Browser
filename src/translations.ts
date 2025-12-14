
export const translations = {
    en: {
        welcome: "MixBrowser",
        searchPlaceholder: "Search with {engine}...",
        newTab: "New Tab",
        closeTab: "Close Tab",
        back: "Back",
        forward: "Forward",
        reload: "Reload",
        settings: "Settings",
        appearance: "Appearance",
        theme: "Theme Mode",
        dark: "Dark",
        light: "Light",
        accentColor: "Accent Color",
        wallpaper: "Custom Wallpaper URL",
        translucency: "Translucency",
        roundness: "Roundness",
        searchEngine: "Default Search Engine",
        shortcuts: "Keyboard Shortcuts",
        shortcutsDesc: "Click to edit",
        version: "MixBrowser v0.5.0 (Beta)",
        language: "Language",
        english: "English",
        turkish: "Türkçe",

        inspect: "Inspect Element",
        copy: "Copy",
        paste: "Paste",

        pinTab: "Pin Tab",
        unpinTab: "Unpin Tab",
        duplicateTab: "Duplicate Tab",
        closeOtherTabs: "Close Other Tabs",
        browserConsole: "Browser Console",
        themePink: "Pink (Default)",
        themeRed: "Red",

        themeBlue: "Blue",
        themeGreen: "Green",
        orLocal: "or select local file:",

        browseFiles: "Browse Files",
        profile: "Profile & Safety",
        passwords: "Passwords",
        privacy: "Privacy",
        stats: "Usage Stats",
        importCsv: "Import CSV",
        exportCsv: "Export CSV",
        doNotTrack: "Do Not Track",
        recordStats: "Record Browsing Statistics",
        statsDisabled: "Statistics Recording is Disabled"
    },
    tr: {
        welcome: "MixBrowser",
        searchPlaceholder: "{engine} ile ara...",
        newTab: "Yeni Sekme",
        closeTab: "Sekmeyi Kapat",
        back: "Geri",
        forward: "İleri",
        reload: "Yenile",
        settings: "Ayarlar",
        appearance: "Görünüm",
        theme: "Tema Modu",
        dark: "Koyu",
        light: "Açık",
        accentColor: "Vurgu Rengi",
        wallpaper: "Özel Duvar Kağıdı URL",
        translucency: "Saydamlık",
        roundness: "Yuvarlaklık",
        searchEngine: "Varsayılan Arama Motoru",
        shortcuts: "Klavye Kısayolları",
        shortcutsDesc: "Düzenlemek için tıklayın",
        version: "MixBrowser v0.6.0 (Beta)",
        language: "Dil",
        english: "English",
        turkish: "Türkçe",
        inspect: "Öğeyi İncele",
        copy: "Kopyala",
        paste: "Yapıştır",
        pinTab: "Sekmeyi Sabitle",
        unpinTab: "Sabitlemeyi Kaldır",
        duplicateTab: "Sekmeyi Çoğalt",
        closeOtherTabs: "Diğerlerini Kapat",
        browserConsole: "Tarayıcı Konsolu",
        themePink: "Pembe (Varsayılan)",
        themeRed: "Kırmızı",

        themeBlue: "Mavi",
        themeGreen: "Yeşil",
        orLocal: "veya yerel dosya seç:",

        browseFiles: "Gözat",
        profile: "Profil ve Güvenlik",
        passwords: "Parolalar",
        privacy: "Gizlilik",
        stats: "Kullanım İstatistikleri",
        importCsv: "CSV İçe Aktar",
        exportCsv: "CSV Dışa Aktar",
        doNotTrack: "İzleme",
        recordStats: "Tarama İstatistiklerini Kaydet",
        statsDisabled: "İstatistik Kaydı Devre Dışı"
    }
};

export type Language = 'en' | 'tr';

export const useTranslation = (lang: Language) => {
    return (key: keyof typeof translations['en'], params?: Record<string, string>) => {
        let text = translations[lang][key] || translations['en'][key] || key;
        if (params) {
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
        }
        return text;
    };
};
