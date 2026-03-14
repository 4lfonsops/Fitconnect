/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Manrope"', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(0, 0, 0, 0.08)',
        card: '0 10px 30px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        xl: '18px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}

