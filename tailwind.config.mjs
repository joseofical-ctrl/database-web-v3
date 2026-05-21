/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        upla: {
          dark: '#0A1128', // Fondo principal (Azul marino oscuro)
          primary: '#1E3A8A', // Azul institucional
          accent: '#00B4D8', // Celeste para botones y contrastes
          light: '#F8FAFC'
        }
      },
      fontFamily: {
        heading: ['Impact', 'sans-serif'], // Fuente robusta para el Hero
        body: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}