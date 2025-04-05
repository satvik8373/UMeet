/** @type {import('tailwindcss').Config} */
import scrollbar from 'tailwind-scrollbar'

const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        background: '#000000',
        surface: '#1C1C1E',
        text: '#FFFFFF',
        'text-secondary': '#8E8E93',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'gradient-1': 'gradient-1 15s ease infinite',
        'gradient-2': 'gradient-2 15s ease infinite',
        'gradient-3': 'gradient-3 15s ease infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-slower': 'float-slower 12s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 10s ease-in-out infinite',
      },
      keyframes: {
        'gradient-1': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-2': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          }
        },
        'gradient-3': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center right'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center left'
          }
        },
        'float-slow': {
          '0%, 100%': {
            transform: 'translate(0, 0)'
          },
          '50%': {
            transform: 'translate(20px, 20px)'
          }
        },
        'float-slower': {
          '0%, 100%': {
            transform: 'translate(0, 0)'
          },
          '50%': {
            transform: 'translate(-20px, -20px)'
          }
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '0.5',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.1)'
          }
        }
      },
    },
  },
  plugins: [
    scrollbar({ nocompatible: true }),
  ],
}

export default config 