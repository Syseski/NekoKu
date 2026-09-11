import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff6f4',
          100: '#ffede8',
          200: '#ffdcd4',
          300: '#ffbfb1',
          400: '#ff947f',
          500: '#ff6b4a', // Primary Terracotta
          600: '#ee4c27',
          700: '#c83815',
          800: '#a53015',
          900: '#872c17',
        },
        sage: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c5e0d0',
          500: '#38a169',
          600: '#2f855a',
          700: '#276749',
        },
        surface: {
          cream: '#FAF8F5',
          card: '#FFFFFF',
          dark: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-up': 'fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-down': 'fadeSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3.5s ease-in-out infinite',
        'pulse-gentle': 'pulseGentle 2.5s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
