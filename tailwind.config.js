/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#1A1A1A',
        gold: '#C9973A',
        'gold-light': '#D4A94E',
        'gold-dark': '#B8860B',
        'bg-primary': '#0F0F0F',
        'bg-secondary': '#1A1A1A',
        'bg-tertiary': '#242424',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1A6',
        'text-muted': '#6E6E73',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'hero': 'clamp(2.4rem, 5.5vw, 4.5rem)',
        'section': 'clamp(2rem, 4vw, 3.5rem)',
        'sub': 'clamp(1.25rem, 2.5vw, 2rem)',
      },
      maxWidth: {
        'content': '980px',
        'wide': '1200px',
      },
      borderRadius: {
        'pill': '980px',
      },
    },
  },
  plugins: [],
}
