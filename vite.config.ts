import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

// SPA fallback so client-side routes under /investor-memo/ (Open Slide's
// /s/:slideId router) resolve to the deck's index.html on static hosts.
function spaFallback() {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      addFallbackMiddleware(server.middlewares, server.config.root);
    },
    configurePreviewServer(server) {
      addFallbackMiddleware(server.middlewares, server.config.root);
    },
  };
}

function addFallbackMiddleware(middlewares, root) {
  middlewares.use((req, res, next) => {
    const url = req.url!;
    if (url.startsWith('/investor-memo/') && !url.includes('.')) {
      const filePath = path.resolve(root, 'dist', url.slice(1));
      if (!fs.existsSync(filePath)) {
        req.url = '/investor-memo/index.html';
      }
    }
    next();
  });
}

export default defineConfig({
  plugins: [preact(), tailwindcss(), spaFallback()],
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
  },
  server: {
    port: 3000,
    open: true,
  },
});