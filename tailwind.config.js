/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        foreground: "var(--color-neutral-darkest)",
        "muted-foreground": "rgba(0, 0, 0, 0.6)",
        secondary: "rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
}

