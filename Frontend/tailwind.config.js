const { heroui } = require("@heroui/theme");
/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "// Corrección de @heroui a @nextui-org",
    "./node_modules/@heroui/theme/dist/components/(button|code|dropdown|input|kbd|link|modal|navbar|snippet|toggle|ripple|spinner|menu|divider|popover|form).js",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui(), heroui()], // Corrección de heroui() a nextui()
};
