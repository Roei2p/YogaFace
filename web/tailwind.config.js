/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf4f0",
          100: "#fbe6dc",
          400: "#e79b73",
          500: "#d97a4a",
          600: "#c1613a",
          700: "#a04d2e",
        },
      },
    },
  },
  plugins: [],
};
