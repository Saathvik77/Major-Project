import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme] = useState('default');
    const [activeTheme] = useState('default');

    useEffect(() => {
        // Force cinematic dark theme globally
        document.documentElement.setAttribute('data-theme', 'default');
        document.documentElement.classList.remove('light-mode');
        localStorage.setItem('appTheme', 'default');
    }, []);

    const setAppTheme = () => {}; // No-op to prevent changes
    const toggleTheme = () => {}; // No-op
    const isLightMode = false;

    return (
        <ThemeContext.Provider value={{ theme, activeTheme, setAppTheme, isLightMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
