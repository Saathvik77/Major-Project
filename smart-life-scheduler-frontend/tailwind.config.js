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

        // New Neon Palette
        neonPrimary: "#7C6CFF",
        neonSecondary: "#00E5FF",
        neonAccent: "#FF7AF6",
        neonHighlight: "#FFD166",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
