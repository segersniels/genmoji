const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
      colors: {
        gradient: {
          from: 'rgb(236, 63, 251)',
          to: 'rgb(252, 229, 70)',
        },
      },
    },
  },
  plugins: [],
};
