/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#241f1b",
        paper: "#fbf6f0",
        brand: {
          50: "#fdf4ef",
          100: "#fae4d7",
          200: "#f3c7a8",
          300: "#eaa172",
          400: "#df7f4c",
          500: "#cf6536",
          600: "#b2502a",
          700: "#8f3f22",
          800: "#6e311b",
          900: "#4a2113",
        },
        sage: {
          50: "#f5f7f0",
          100: "#e6ecdb",
          200: "#cbd9b5",
          300: "#adc38c",
          400: "#8fab68",
          500: "#73914d",
          600: "#5a733c",
          700: "#46592f",
          800: "#334322",
          900: "#212c16",
        },
      },
      fontFamily: {
        serif: ['"Frank Ruhl Libre"', "Georgia", "serif"],
        sans: ["Heebo", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 25px 60px -20px rgba(178, 80, 42, 0.45)",
        card: "0 1px 2px rgba(36, 31, 27, 0.04), 0 12px 32px -16px rgba(36, 31, 27, 0.12)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(3%, -4%) scale(1.05)" },
          "66%": { transform: "translate(-2%, 3%) scale(0.97)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        drift: "drift 18s ease-in-out infinite",
        "drift-slow": "drift 26s ease-in-out infinite reverse",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
