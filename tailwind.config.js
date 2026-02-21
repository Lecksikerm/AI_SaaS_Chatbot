/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#202123',
        main: '#343541',
        secondary: '#444654',
        accent: '#10a37f',
        'accent-hover': '#0d8c6d',
        border: '#4d4d4f',
        'text-primary': '#ececf1',
        'text-secondary': '#8e8ea0',
      },
    },
  },
  plugins: [],
}