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
        background: "var(--color-bg)",
        card: "var(--color-card)",
        cardHover: "var(--color-card-hover)",
        borderGlow: "var(--color-border-glow)",
        borderCustom: "var(--color-border)",
        inputBg: "var(--color-input-bg)",
        headerBorder: "var(--color-header-border)",
        categoryBtnActiveBg: "var(--color-category-btn-active-bg)",
        categoryBtnActiveText: "var(--color-category-btn-active-text)",
        neonBlue: "#3b82f6",
        neonPurple: "#6366f1",
        textPrimary: "var(--color-text-primary)",
        textSecondary: "var(--color-text-secondary)",
        textMuted: "var(--color-text-muted)"
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
