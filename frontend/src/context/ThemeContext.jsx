import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ThemeContext — manages dark/light theme for the AURA platform.
 *
 * Theme is applied by toggling the "dark" / "light" class on <html>.
 * CSS custom properties in index.css respond to those classes, driving
 * ALL color tokens throughout the application.
 *
 * To change theme colors, edit index.css — NOT this file.
 */
const ThemeContext = createContext(null);

const STORAGE_KEY = 'aura-theme';
const DARK  = 'dark';
const LIGHT = 'light';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Respect previously saved preference; fall back to system preference
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === DARK || saved === LIGHT) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  });

  // Sync <html> class whenever theme changes
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(DARK, LIGHT);
    html.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === DARK ? LIGHT : DARK);

  const isDark  = theme === DARK;
  const isLight = theme === LIGHT;

  return (
    <ThemeContext.Provider value={{ theme, isDark, isLight, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
