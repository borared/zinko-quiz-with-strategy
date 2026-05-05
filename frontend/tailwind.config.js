/** @type {import('tailwindcss').Config} */
// tailwind.config.js
export default {
  theme: {
    extend: {
      keyframes: {
        liquid: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.2, 0.8)" },
          "50%": { transform: "scale(0.85, 1.15)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        liquid: "liquid 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
}