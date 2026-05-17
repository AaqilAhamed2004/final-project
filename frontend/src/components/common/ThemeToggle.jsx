import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle — floating button that switches between dark and light modes.
 * Uses ThemeContext; all color changes cascade through CSS variables in index.css.
 */
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative flex items-center justify-center w-9 h-9 rounded-lg
        border border-aura-border bg-aura-surface
        text-aura-text-muted hover:text-aura-accent
        hover:border-aura-accent hover:bg-aura-surface-hover
        transition-all duration-200 focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-aura-accent
        ${className}
      `}
    >
      {isDark ? (
        <Sun size={16} className="transition-transform duration-200 rotate-0" />
      ) : (
        <Moon size={16} className="transition-transform duration-200 rotate-0" />
      )}
    </button>
  );
}
