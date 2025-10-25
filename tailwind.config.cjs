/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b1220',
        card: '#121a2a',
        muted: '#8ea0b5',
        txt: '#e6edf6',
        accent: '#5dd6ff',
        good: '#31c48d',
        bad: '#ef4444',
      },
      boxShadow: {
        soft: '0 10px 25px rgba(0,0,0,.35)',
      },
      fontFamily: {
        ui: ['system-ui','-apple-system','Segoe UI','Roboto','Ubuntu','Helvetica Neue','Arial'],
      },
    },
  },
  plugins: [],
}