import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { themeApiPlugin } from '../theme-api';

export default defineConfig({
  plugins: [react(), themeApiPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@xui/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url))
    }
  }
});
