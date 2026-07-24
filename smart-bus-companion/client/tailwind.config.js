/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'transit-ink': 'var(--transit-ink)',
        'signal-amber': 'var(--signal-amber)',
        'route-magenta': 'var(--route-magenta)',
        'transit-green': 'var(--transit-green)',
        'alert-red': 'var(--alert-red)',
        'paper': 'var(--paper)',
        'ink': 'var(--ink)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

// style updates
