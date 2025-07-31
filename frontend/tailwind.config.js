/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // MGA CI Farben
      colors: {
        mga: {
          white: "#FFFFFF",
          red: "#F63330",
          cream: "#FDF8E5",
          cyan: "#1ED8E6",
          slate: "#2E3C49",
          midnight: "#1D262D",
          yellow: "#FFE066", // <--- ADDED!
        },
      },

      // Deine bestehenden Keyframes
      keyframes: {
        zoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.2)" },
        },
      },

      // Deine bestehenden Animationen
      animation: {
        zoom: "zoom 5s linear",
      },
    },
  },
  plugins: [],
};
