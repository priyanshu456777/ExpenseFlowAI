/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: 'rgb(var(--color-base-950) / <alpha-value>)',
          900: 'rgb(var(--color-base-900) / <alpha-value>)', // primary background
          800: 'rgb(var(--color-base-800) / <alpha-value>)', // card surface
          700: 'rgb(var(--color-base-700) / <alpha-value>)',
          600: 'rgb(var(--color-base-600) / <alpha-value>)', // borders
          500: 'rgb(var(--color-base-500) / <alpha-value>)',
        },
        ink: {
          100: 'rgb(var(--color-ink-100) / <alpha-value>)', // primary text
          300: 'rgb(var(--color-ink-300) / <alpha-value>)',
          400: 'rgb(var(--color-ink-400) / <alpha-value>)', // secondary text
          500: 'rgb(var(--color-ink-500) / <alpha-value>)',
        },
        indigo: {
          400: '#818CF8',
          500: '#6366F1', // accent blue
          600: '#4F46E5',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6', // accent purple
          600: '#7C3AED',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981', // accent emerald
          600: '#059669',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10B981 0%, #6366F1 100%)',
        'gradient-radial-glow': 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.15), transparent 60%)',
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 40px -10px rgba(16, 185, 129, 0.35)',
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)',
        'card-hover': '0 1px 2px rgba(0,0,0,0.4), 0 16px 40px -12px rgba(99,102,241,0.25)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 4s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
      },
    },
  },
  plugins: [],
};