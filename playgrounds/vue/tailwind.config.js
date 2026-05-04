/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}', '../../packages/{core,react,vue}/src/**/*.{ts,tsx,vue}'],
  theme: {
    extend: {}
  },
  plugins: []
};
