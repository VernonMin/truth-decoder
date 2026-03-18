/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-yellow': '#CCFF00',
        'alert-red': '#FF3B30',
        'dark-bg': '#000000',
        'dark-card': '#0a0a0a',
        'dark-border': '#1a1a1a',
      },
      fontFamily: {
        mono: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'scan': 'scan 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #CCFF00, 0 0 10px #CCFF00' },
          '50%': { boxShadow: '0 0 20px #CCFF00, 0 0 30px #CCFF00' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
