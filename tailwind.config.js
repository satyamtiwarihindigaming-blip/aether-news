/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090a0f",
        card: "#12131a",
        cardHover: "#181a24",
        borderGlow: "#252733",
        neonBlue: "#3b82f6",
        neonPurple: "#6366f1",
        textPrimary: "#f3f4f6",
        textSecondary: "#9ca3af",
        textMuted: "#6b7280"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "primary-glow": "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        "accent-purple": "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
      },
    },
  },
  plugins: [],
};
