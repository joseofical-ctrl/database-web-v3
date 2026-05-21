import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server', // Habilita la ejecución de código en servidor (API Endpoints)
  adapter: vercel(),
  integrations: [tailwind(), react()],
});