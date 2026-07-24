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
        // Keep old ones just in case they're used in unmodified files
        primary: '#0B3D91',
        accent: '#FFC107',
        alert: '#E53935',
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
