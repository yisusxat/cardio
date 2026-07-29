/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — Crimson Red (medical confidence, vitality)
        primary: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // Neutral — Warm whites and grays for clean clinical look
        neutral: {
          0:   '#ffffff',
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Secondary — Gray & Black (text, borders, secondary surfaces)
        gray: {
          25:  '#fcfcfc',
          50:  '#f9f9f9',
          100: '#f2f2f2',
          200: '#e8e8e8',
          300: '#d1d1d1',
          400: '#a8a8a8',
          500: '#737373',
          600: '#4f4f4f',
          700: '#3a3a3a',
          800: '#262626',
          900: '#141414',
          950: '#080808',
        },
        crimson: {
          950: '#1a0008',
          900: '#2d0012',
          800: '#4a0020',
          700: '#6b0030',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 4vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'luxury': '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 4px -1px rgba(0,0,0,0.04)',
        'luxury-md': '0 8px 40px -8px rgba(0,0,0,0.12), 0 2px 8px -2px rgba(0,0,0,0.06)',
        'luxury-lg': '0 20px 60px -12px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.08)',
        'red-glow': '0 8px 32px -4px rgba(225, 29, 72, 0.25)',
        'red-glow-lg': '0 16px 48px -8px rgba(225, 29, 72, 0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1a0008 0%, #2d0012 40%, #4a0020 70%, #6b0030 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
        'red-gradient': 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
