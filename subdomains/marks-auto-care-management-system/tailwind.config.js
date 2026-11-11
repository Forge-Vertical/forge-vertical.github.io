/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Placeholder values sampled from the logo crop — swap these for the
        // exact hex values from Marks Autocare's real logo/brand file once we
        // have it (e.g. an Illustrator/Figma export, not a screenshot).
        brand: {
          lime: '#B6D634',   // signature neon-lime green
          dark: '#141414',   // near-black used behind the logo/nav
          charcoal: '#1f2227',
          ink: '#0b0d10',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Arial Black"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
