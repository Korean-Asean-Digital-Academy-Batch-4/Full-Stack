/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 40px rgba(37, 50, 90, 0.15)",
        soft: "0 8px 24px rgba(30, 42, 75, 0.08)",
      },
    },
  },
  plugins: [],
};
