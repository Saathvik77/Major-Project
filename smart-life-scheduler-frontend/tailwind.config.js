/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryTeal: "#2DD4BF",
        secondaryCyan: "#06B6D4",
        statusHigh: "#EF4444",
        statusHighBg: "#FEE2E2",
        statusMed: "#F59E0B",
        statusMedBg: "#FEF3C7",
        statusLow: "#10B981",
        statusLowBg: "#D1FAE5",

        // Dynamic Adaptive Palette Mapping
        neonPrimary: "var(--primary)",
        neonSecondary: "var(--secondary)",
        neonAccent: "var(--accent)",
        neonHighlight: "var(--highlight)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
