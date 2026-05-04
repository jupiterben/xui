import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { themeApiPlugin } from '../theme-api';

export default defineConfig({
  plugins: [vue(), themeApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@xui/vue': fileURLToPath(new URL('../../packages/vue/src/index.ts', import.meta.url))
    }
  }
});
