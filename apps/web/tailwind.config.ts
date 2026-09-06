import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: {
            DEFAULT: '#0B2545',
            dark: '#061629',
            light: '#133D73',
          },
          saffron: {
            DEFAULT: '#FF6F00',
            dark: '#E65100',
            light: '#FFA000',
          },
          green: {
            DEFAULT: '#137547',
            dark: '#0B462A',
            light: '#2A9D8F',
          },
          maroon: {
            DEFAULT: '#881337',
            dark: '#4C0519',
          },
          slate: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gov: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'gov-md': '0 4px 6px -1px rgba(11, 37, 69, 0.1), 0 2px 4px -2px rgba(11, 37, 69, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
