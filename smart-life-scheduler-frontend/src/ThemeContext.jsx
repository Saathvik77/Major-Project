import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        // Check local storage for theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsLightMode(true);
            document.documentElement.classList.add('light-mode');
        } else {
            setIsLightMode(false);
            document.documentElement.classList.remove('light-mode');
        }
    }, []);

    const toggleTheme = () => {
        setIsLightMode(prev => {
            const newMode = !prev;
            if (newMode) {
                localStorage.setItem('theme', 'light');
                document.documentElement.classList.add('light-mode');
            } else {
                localStorage.setItem('theme', 'dark');
                document.documentElement.classList.remove('light-mode');
            }
            return newMode;
        });
    };

    return (
        <ThemeContext.Provider value={{ isLightMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
