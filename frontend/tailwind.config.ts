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
        // Neutral base palette
        'off-white': '#fafaf9',
        'warm-gray': {
          50: '#f9f8f6',
          100: '#f2f0ed',
          200: '#e8e4df',
          300: '#d9d3cc',
          400: '#c4bbb0',
          500: '#a89e90',
          600: '#8b8175',
          700: '#726a60',
          800: '#5e5750',
          900: '#4d4842',
        },
        'soft-beige': '#f5f0e8',
        // Vibrant accent (teal)
        accent: {
          DEFAULT: '#e07a75', // Printsy Pink — darker for readability
          50: '#fff1f1',
          100: '#ffe4e3',
          200: '#f9d5d3',
          300: '#f4b9b6',
          400: '#ee928e',
          500: '#e07a75',
          600: '#c45a55',
          700: '#6b4f4f', // Printsy Brown
          800: '#5a4242',
          900: '#4a3636',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

export default config
