/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        water: {
          50: "#eef8ff",
          100: "#d8efff",
          200: "#b9e3ff",
          300: "#80cfff",
          400: "#38aae8",
          500: "#0b6fb3",
          600: "#075f9d",
          700: "#064f82",
          800: "#073f68",
          900: "#062f4f",
        },
        rescue: {
          50: "#fff5ed",
          100: "#ffe8d3",
          200: "#ffc99f",
          500: "#e87624",
          600: "#c75d16",
          700: "#9f4512",
        },
        navy: {
          50: "#edf6fb",
          700: "#103d59",
          800: "#0a3048",
          900: "#062234",
          950: "#031724",
        },
      },
      boxShadow: {
        soft: "0 16px 40px rgba(6, 47, 79, 0.10)",
        panel: "0 22px 70px rgba(6, 47, 79, 0.12)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
