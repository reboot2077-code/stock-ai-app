/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        'bg-card': '#1A1A2E',
        'bg-card-alt': '#16213E',
        'bg-input': '#1E1E3A',
        primary: '#2962FF',
        'primary-light': '#448AFF',
        accent: '#00E5FF',
        'accent-green': '#00E676',
        rise: '#FF4444',
        fall: '#00C853',
        border: '#2A2A4A',
        'border-light': '#3A3A5A',
        'text-secondary': '#9E9E9E',
        'text-muted': '#616161',
        danger: '#FF1744',
        warning: '#FFD740',
      },
      fontFamily: {
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
};
