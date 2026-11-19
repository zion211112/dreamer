import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

const htmlEntries = ['index.html', 'index-vue.html'].map((f) => path.resolve(__dirname, f));

// Vite 6 preview server: SPA fallback for Open Slide /investor-memo/ routes
// AND rewrite of the deck's absolute /assets/* references to
// /investor-memo/assets/* (the deck build uses base "/investor-memo/").
function spaFallback() {
  return {
    name: 'spa-fallback',
    configurePreviewServer(server) {
      const { config } = server;
      const distDir = config.build?.outDir ? path.resolve(config.root, config.build.outDir) : path.resolve(config.root, 'dist');
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (url.startsWith('/investor-memo/') && !url.includes('.')) {
          req.url = '/investor-memo/index.html';
        } else if (url.startsWith('/assets/') && fs.existsSync(path.join(distDir, 'investor-memo', url))) {
          req.url = `/investor-memo${url}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), vue(), spaFallback()],
  root: '.',
  base: process.env.VITE_BASE_PATH || '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: htmlEntries,
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});