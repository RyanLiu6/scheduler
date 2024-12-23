import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced',
    runtime: {
      mode: 'local',
      type: 'worker',
      bindings: {
        DB: {
          type: 'd1',
        },
      },
    },
  }),
});
