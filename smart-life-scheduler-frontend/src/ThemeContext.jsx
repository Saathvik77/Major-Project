import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Possible themes: 'auto', 'default' (blue), 'neon', 'cyberpunk', 'ocean', 'sunset', 'calm', 'light'
    const [theme, setThemeState] = useState('default');
    const [activeTheme, setActiveTheme] = useState('default'); // Default fallback

    useEffect(() => {
        // Load user's saved preference
        const savedTheme = localStorage.getItem('appTheme') || 'default';
        setThemeState(savedTheme);
    }, []);

    useEffect(() => {
        let intervalId;

        const updateTheme = () => {
            if (theme === 'auto') {
                const hour = new Date().getHours();

                let timeBasedTheme = 'default';
                if (hour >= 5 && hour < 12) {
                    timeBasedTheme = 'ocean'; // Morning -> Cyan/Blue
                } else if (hour >= 12 && hour < 17) {
                    timeBasedTheme = 'neon'; // Afternoon -> Purple/Neon
                } else if (hour >= 17 && hour < 21) {
                    timeBasedTheme = 'sunset'; // Evening -> Orange/Purple
                } else {
                    timeBasedTheme = 'default'; // Night -> Dark Blue
                }

                setActiveTheme(timeBasedTheme);
            } else {
                setActiveTheme(theme);
            }
        };

        updateTheme(); // Run immediately

        if (theme === 'auto') {
            // Check every minute if the time-based theme needs to change
            intervalId = setInterval(updateTheme, 60000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [theme]);

    useEffect(() => {
        // Apply theme to the document globally
        document.documentElement.setAttribute('data-theme', activeTheme);

        // Handle backwards compatibility for 'light-mode' class
        if (activeTheme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
    }, [activeTheme]);

    const setAppTheme = (newTheme) => {
        localStorage.setItem('appTheme', newTheme);
        setThemeState(newTheme);
    };

    // For backwards compatibility with old toggleTheme
    const isLightMode = activeTheme === 'light';
    const toggleTheme = () => {
        setAppTheme(isLightMode ? 'auto' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, activeTheme, setAppTheme, isLightMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
