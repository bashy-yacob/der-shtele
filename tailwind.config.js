/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // צבעים שמרניים ומכובדים
        primary: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          500: '#3b5bdb',
          600: '#2f4ac0',
          700: '#2340a8',
        },
        neutral: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        // פונט נקי שתומך היטב בעברית
        sans: ['Heebo', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
