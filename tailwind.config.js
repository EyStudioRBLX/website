/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#08010f',
        'rb-dark': '#0d0118',
        'rb-panel': '#140025',
        'rb-border': '#2a0052',
        'rb-purple': '#6d28d9',
        'rb-glow': '#8b5cf6',
        'rb-light': '#c4b5fd',
        'rb-cyan': '#22d3ee',
        'rb-gold': '#f59e0b',
        'rb-red': '#ef4444',
        'rb-green': '#22c55e',
        'rb-pink': '#e879f9',
      },
      fontFamily: {
        display: ['"Fredoka One"', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      boxShadow: {
        'rb-btn': '0 4px 0 #3b0080, 0 0 20px rgba(109,40,217,0.3)',
        'rb-btn-hover': '0 2px 0 #3b0080, 0 0 25px rgba(139,92,246,0.4)',
        'rb-panel': '0 0 0 1px rgba(109,40,217,0.4), inset 0 1px 0 rgba(167,139,250,0.1)',
        'rb-glow': '0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(109,40,217,0.2)',
        'rb-gold': '0 4px 0 #92400e, 0 0 20px rgba(245,158,11,0.3)',
        'rb-cyan': '0 0 20px rgba(34,211,238,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'scan': 'scanline 6s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-rb': 'bounceRb 0.3s ease',
        'xp-fill': 'xpFill 1.5s ease-out forwards',
        'count-up': 'countUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        scanline: {
          '0%': { top: '-5%' },
          '100%': { top: '105%' },
        },
        bounceRb: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
          '100%': { transform: 'translateY(0)' },
        },
        xpFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--xp-width)' },
        },
      },
    },
  },
  plugins: [],
}
