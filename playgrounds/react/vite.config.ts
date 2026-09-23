import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { themeApiPlugin } from '../theme-api';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, '');

  return {
    envDir: workspaceRoot,
    plugins: [react(), themeApiPlugin(env)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@xui/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          tree: fileURLToPath(new URL('./tree.html', import.meta.url)),
          canvas: fileURLToPath(new URL('./canvas-preview.html', import.meta.url))
        }
      }
    }
  };
});
