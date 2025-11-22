/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use local config preset copied from roastive monorepo
  presets: [require('../packages/config/tailwind/preset.cjs')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        none: '0px',
        lg: '0px',
        md: '0px',
        sm: '0px',
        DEFAULT: '0px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};