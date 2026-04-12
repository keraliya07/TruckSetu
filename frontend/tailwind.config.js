import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#e2e8f0',
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0f766e',
          600: '#0d9488',
          700: '#115e59',
        },
        freight: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0f766e',
          600: '#0d9488',
          700: '#115e59',
        },
        signal: {
          500: '#f97316',
          600: '#ea580c',
        },
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 40px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 20px 60px rgba(15, 23, 42, 0.14)',
        'glow-primary': '0 0 20px rgba(13, 148, 136, 0.25), 0 0 60px rgba(13, 148, 136, 0.10)',
        'glow-accent': '0 0 20px rgba(99, 102, 241, 0.25), 0 0 60px rgba(99, 102, 241, 0.10)',
        'glow-danger': '0 0 20px rgba(244, 63, 94, 0.25), 0 0 60px rgba(244, 63, 94, 0.10)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'dashboard-grid':
          'linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
        'mesh-gradient':
          'radial-gradient(at 20% 0%, rgba(13,148,136,0.12) 0%, transparent 50%), radial-gradient(at 80% 0%, rgba(99,102,241,0.10) 0%, transparent 50%), radial-gradient(at 50% 100%, rgba(34,197,94,0.08) 0%, transparent 50%)',
        'auth-gradient':
          'radial-gradient(at 0% 0%, rgba(13,148,136,0.18) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(99,102,241,0.14) 0%, transparent 50%), radial-gradient(at 50% 80%, rgba(34,197,94,0.10) 0%, transparent 50%)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-shrink': {
          from: { width: '100%' },
          to: { width: '0%' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.5s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.25s ease-out both',
        'slide-down': 'slide-down 0.3s ease-out both',
        'progress-shrink': 'progress-shrink linear',
      },
    },
  },
  plugins: [forms, typography],
};
