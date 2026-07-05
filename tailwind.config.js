/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        water: {
          50: "#eef8ff",
          100: "#d8efff",
          500: "#0b6fb3",
          600: "#075f9d",
          700: "#064f82",
        },
        rescue: {
          50: "#fff5ed",
          500: "#e87624",
          600: "#c75d16",
        },
      },
      boxShadow: {
        soft: "0 14px 35px rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
