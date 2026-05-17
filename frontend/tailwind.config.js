/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // darkMode is managed via the class strategy so ThemeContext can
  // toggle the "dark" class on <html>, which overrides CSS variables.
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Semantic color tokens (bridged from CSS custom properties) ───
      // All values reference CSS variables defined in index.css.
      // Changing the variable value in ONE place updates every component.
      colors: {
        // ── Primary accent (gold/amber) ──
        'aura-accent':        'var(--color-accent)',
        'aura-accent-hover':  'var(--color-accent-hover)',
        'aura-accent-muted':  'var(--color-accent-muted)',

        // ── Backgrounds ──
        'aura-bg':            'var(--color-bg)',
        'aura-bg-secondary':  'var(--color-bg-secondary)',
        'aura-surface':       'var(--color-surface)',
        'aura-surface-hover': 'var(--color-surface-hover)',
        'aura-card':          'var(--color-card)',
        'aura-card-hover':    'var(--color-card-hover)',

        // ── Borders ──
        'aura-border':        'var(--color-border)',
        'aura-border-strong': 'var(--color-border-strong)',

        // ── Text ──
        'aura-text':          'var(--color-text)',
        'aura-text-muted':    'var(--color-text-muted)',
        'aura-text-faint':    'var(--color-text-faint)',

        // ── Sidebar specific ──
        'aura-sidebar':       'var(--color-sidebar)',
        'aura-sidebar-hover': 'var(--color-sidebar-hover)',

        // ── Navbar specific ──
        'aura-navbar':        'var(--color-navbar)',

        // ── Semantic status colors ──
        'aura-red':           'var(--color-red)',
        'aura-orange':        'var(--color-orange)',
        'aura-yellow':        'var(--color-yellow)',
        'aura-green':         'var(--color-green)',
        'aura-blue':          'var(--color-blue)',

        // ── Legacy aliases (kept for backward compatibility) ──
        'aura-amber':         'var(--color-accent)',
      },

      fontFamily: {
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
      },

      boxShadow: {
        'aura-glow':    '0 0 20px var(--color-accent-muted)',
        'aura-glow-sm': '0 0 10px var(--color-accent-muted)',
        'aura-card':    '0 4px 24px var(--shadow-card)',
        'aura-nav':     '0 2px 16px var(--shadow-nav)',
      },

      borderRadius: {
        'aura': '8px',
      },

      transitionDuration: {
        'theme': '200ms',
      },
    },
  },
  plugins: [],
}
