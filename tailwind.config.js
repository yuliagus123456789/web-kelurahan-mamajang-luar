/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        makassar: {
          50:  '#fdf2f4',
          100: '#fce7eb',
          200: '#f9cdd8',
          300: '#f4a3b8',
          400: '#ec6d90',
          500: '#d93d6a',
          600: '#c22452',
          700: '#a31b44',
          800: '#8B2342',
          900: '#761d38',
          950: '#440b1c',
        },
        gold: {
          50:  '#fefcf0',
          100: '#fdf6d3',
          200: '#fceaa5',
          300: '#f9d86d',
          400: '#f5c132',
          500: '#E5A811',
          600: '#C8940E',
          700: '#a06d0a',
          800: '#835610',
          900: '#6c4713',
          950: '#3e2506',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2.5s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
