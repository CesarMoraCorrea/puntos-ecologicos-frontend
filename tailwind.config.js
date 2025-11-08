/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        binWhite: '#ffffff',
        binGreen: '#22c55e',
        binBlack: '#111827',
      },
    },
  },
  plugins: [],
};