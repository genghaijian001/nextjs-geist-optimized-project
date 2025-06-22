/** @type {import('tailwindcss').Config} */
module.exports = {
  // 根据你的项目目录结构调整下面的路径
  content: [
    './src/**/*.{js,jsx,ts,tsx,vue,wxml,wxss}',
    './components/**/*.{js,jsx,ts,tsx,vue,wxml,wxss}',
    './pages/**/*.{js,jsx,ts,tsx,vue,wxml,wxss}',
  ],
  // 小程序端不需要 Preflight（重置样式）
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}