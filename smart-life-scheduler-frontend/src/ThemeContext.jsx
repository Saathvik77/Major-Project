import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'default');

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.setAttribute('data-theme', 'default');
            document.documentElement.classList.remove('light-mode');
        }
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'default' : 'light');
    };

    const isLightMode = theme === 'light';

    return (
        <ThemeContext.Provider value={{ theme, setAppTheme: setTheme, isLightMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
