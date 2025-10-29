import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        cream: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fdf4e8',
          300: '#fbefd9',
          400: '#f8e5c3',
          500: '#f4d9a6',
          600: '#e8c282',
          700: '#d9a961',
          800: '#c18d45',
          900: '#8b6332',
        },
      },
    },
  },
  plugins: [],
}
export default config
