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
        background: "#07070a",
        card: "rgba(13, 13, 21, 0.45)",
        cardHover: "rgba(22, 22, 38, 0.6)",
        borderGlow: "rgba(0, 242, 254, 0.25)",
        neonBlue: "#00f2fe",
        neonPurple: "#b152ff",
        textPrimary: "#f1f3f9",
        textSecondary: "#9aa0b5",
        textMuted: "#626880"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "primary-glow": "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
        "accent-purple": "linear-gradient(135deg, #b152ff 0%, #7c22ff 100%)",
      },
    },
  },
  plugins: [],
};
