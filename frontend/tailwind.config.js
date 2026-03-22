/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#131313',
        'surface-container': '#20201f',
        'surface-container-high': '#2a2a29',
        'surface-container-highest': '#333333',
        'surface-container-lowest': '#0e0e0e',
        primary: '#a8e8ff',
        'primary-container': '#7dd3fc', // Darker cyan for hover states
        'on-primary': '#000000',
        secondary: '#00ff40', // Phosphor green
        'secondary-container': '#00cc33',
        tertiary: '#ff4444', // Crimson
        'outline-variant': 'rgba(255, 255, 255, 0.15)'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Grotesk"', 'monospace']
      },
      boxShadow: {
        'mechanical': 'inset 2px 2px 0px rgba(0,0,0,0.5)',
        'glow': '0 0 8px rgba(168, 232, 255, 0.3)',
        'glow-primary': '0 0 1px #a8e8ff',
      },
      animation: {
        'flicker': 'flicker 5s infinite step-end',
        'scan-in': 'scanIn 0.5s ease-out forwards',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '95%': { opacity: 0.95 },
          '96%': { opacity: 1 },
          '97%': { opacity: 0.95 },
          '98%': { opacity: 1 },
          '99%': { opacity: 0.8 },
        },
        scanIn: {
          '0%': { backgroundPosition: '0 -100%', opacity: 0 },
          '100%': { backgroundPosition: '0 0', opacity: 1 }
        }
      }
    },
  },
  plugins: [],
}
