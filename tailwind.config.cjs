/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(20px, 20px)' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-20px, -20px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.05)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-slower': 'float-slower 12s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 10s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
} 