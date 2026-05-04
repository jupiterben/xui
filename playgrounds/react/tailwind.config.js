/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/{core,react,vue}/src/**/*.{ts,tsx,vue}'],
  theme: {
    extend: {}
  },
  plugins: []
};
