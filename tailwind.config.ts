import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0284c7 0%, #9333ea 100%)',
        'gradient-primary-hover': 'linear-gradient(135deg, #0369a1 0%, #7c3aed 100%)',
        'gradient-light': 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%)',
        'gradient-hero': 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #e0f2fe 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;