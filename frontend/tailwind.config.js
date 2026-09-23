/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          light: '#FBF7F0',
          dark: '#151D28',
          card: '#FFFFFF',
          cardDark: '#1E2836',
          sand: '#E8DFD0',
          sandDark: '#28374A'
        },
        ink: {
          DEFAULT: '#1E2A3A',
          muted: '#607085',
          light: '#8E9BAE',
          dark: '#EAE6DF',
          darkMuted: '#9CAABF'
        },
        marigold: {
          DEFAULT: '#F2A900',
          light: '#FCE7B2',
          dark: '#D99700',
          hover: '#E09B00'
        },
        terracotta: {
          DEFAULT: '#D9663A',
          light: '#F7DDD3',
          dark: '#C05329',
          hover: '#C75A30'
        },
        sage: {
          DEFAULT: '#5B8C6A',
          light: '#E2EFE6',
          dark: '#487355',
          hover: '#507C5D'
        },
        brick: {
          DEFAULT: '#B5443B',
          light: '#FBE8E6',
          dark: '#9E3830'
        }
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['Caveat', 'cursive']
      },
      boxShadow: {
        paper: '0 2px 8px -2px rgba(30, 42, 58, 0.08), 0 1px 4px -1px rgba(30, 42, 58, 0.04)',
        paperHover: '0 8px 24px -4px rgba(30, 42, 58, 0.12), 0 2px 8px -2px rgba(30, 42, 58, 0.06)',
        pin: '0 3px 6px rgba(0,0,0,0.16), 0 1px 2px rgba(0,0,0,0.23)'
      },
      rotate: {
        'tag-left': '-1.5deg',
        'tag-right': '1.5deg',
        'tape-left': '-2deg',
        'tape-right': '2.5deg'
      }
    },
  },
  plugins: [],
}
