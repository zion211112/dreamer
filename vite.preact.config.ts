import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  root: 'preact',
  plugins: [preact()],
  resolve: { alias: { '@': new URL('./preact/src', import.meta.url).pathname } },
  server: {
    port: 5174,
    strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: false } },
  },
  preview: { port: 4173 },
  build: { outDir: '../dist-preact', emptyOutDir: true },
});
