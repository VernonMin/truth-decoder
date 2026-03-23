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
        'neon-yellow': '#FF6EB4',
        'alert-red': '#FB7185',
        'dark-bg': '#FFF5FB',
        'dark-card': '#FFFFFF',
        'dark-border': '#F9C8E0',
      },
      fontFamily: {
        mono: ['Nunito', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      animation: {
        'scan': 'scan 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #FF6EB4, 0 0 10px #FF6EB4' },
          '50%': { boxShadow: '0 0 20px #FF6EB4, 0 0 30px #FF6EB4' },
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
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
