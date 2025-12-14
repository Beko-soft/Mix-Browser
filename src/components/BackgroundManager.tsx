
import React, { useEffect } from 'react';

const BackgroundManager: React.FC<{ accentColor: string; customWallpaper?: string }> = ({ accentColor, customWallpaper }) => {
    useEffect(() => {
        const root = document.documentElement;

        // Handle User Custom Wallpaper
        if (customWallpaper) {
            document.body.style.background = `url(${customWallpaper}) no-repeat center center fixed`;
            document.body.style.backgroundSize = 'cover';
            // Set a neutral dark panel for custom wallpapers to ensure readability
            root.style.setProperty('--panel-bg', 'rgba(20, 20, 30, 0.7)');
            return;
        }

        // Predefined Premium Designs mapped to Colors
        const designs: { [key: string]: string } = {
            '#ec4899': 'linear-gradient(135deg, #2a0a18 0%, #5e1135 50%, #ec4899 100%)', // Pink: Neon City
            '#ef4444': 'radial-gradient(circle at top right, #450a0a, #1f0505 60%, #000000 100%)', // Red: Volcano
            '#3b82f6': 'linear-gradient(to bottom, #020617, #172554, #3b82f6)', // Blue: Deep Ocean
            '#10b981': 'radial-gradient(circle at 50% 50%, #064e3b 0%, #022c22 40%, #000000 100%)' // Green: Matrix Forest
        };

        const bg = designs[accentColor];

        if (bg) {
            document.body.style.background = bg;
            document.body.style.backgroundAttachment = 'fixed';
        } else {
            // Fallback for unknown colors or intermediate states (keep dynamic calculations)
            let r = 0, g = 0, b = 0;
            if (accentColor.length === 7) {
                r = parseInt(accentColor.slice(1, 3), 16);
                g = parseInt(accentColor.slice(3, 5), 16);
                b = parseInt(accentColor.slice(5, 7), 16);
            }
            const richMid = `rgba(${r * 0.25}, ${g * 0.25}, ${b * 0.25}, 1)`;
            const richDark = `rgba(${r * 0.15}, ${g * 0.15}, ${b * 0.15}, 1)`;
            document.body.style.background = `radial-gradient(circle at 50% 0%, ${richMid} 0%, ${richDark} 80%)`;
            document.body.style.backgroundAttachment = 'fixed';
        }

        // Dynamic Panel Tint logic
        let r = 0, g = 0, b = 0;
        if (accentColor.length === 7) {
            r = parseInt(accentColor.slice(1, 3), 16);
            g = parseInt(accentColor.slice(3, 5), 16);
            b = parseInt(accentColor.slice(5, 7), 16);
        }
        root.style.setProperty('--panel-bg', `rgba(${r * 0.1}, ${g * 0.1}, ${b * 0.1}, 0.8)`);

    }, [accentColor, customWallpaper]);

    return null;
};

export default BackgroundManager;
