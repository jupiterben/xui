import { fileURLToPath, URL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@xui/svelte': fileURLToPath(new URL('../../packages/svelte/src/index.ts', import.meta.url))
    }
  }
});
