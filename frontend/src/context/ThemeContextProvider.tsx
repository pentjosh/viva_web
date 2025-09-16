import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';

const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<string>(()=> {
        return localStorage.getItem('theme') || 'red-light';
    });

    const toggleTheme = () => {
        setTheme((currTheme) => {
            const newTheme = currTheme === 'red-dark' ? 'red-light' : 'red-dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    },[theme]);;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
};

export default ThemeContextProvider;