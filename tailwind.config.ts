import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Retro Pokemon Red/White/Black palette
        retro: {
          red: '#dc0a2d',
          'red-dark': '#a00824',
          'red-light': '#ff1744',
          black: '#000000',
          'black-light': '#212121',
          white: '#ffffff',
          'white-dark': '#f5f5f5',
          gray: '#808080',
          'gray-light': '#c0c0c0',
          'gray-dark': '#404040',
          blue: '#3b82f6',
          yellow: '#fbbf24',
        },
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pixel-pulse': 'pixel-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'pixel-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 0, 0, 0.25)',
        'pixel-lg': '8px 8px 0px 0px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
