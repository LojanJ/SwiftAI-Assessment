import { createContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({children}) {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : window.matchMedia('(prefer-color-schema: dark)').matches
    })
    const toggleTheme = () => setIsDark(!isDark);

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    }, [isDark])

    return (
        <ThemeContext.Provider value={{isDark, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}