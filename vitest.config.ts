import { defineConfig, mergeConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      'react-dom/test-utils': 'preact/test-utils',
    },
  },
  optimizeDeps: {
    include: ['wouter', 'use-sync-external-store'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    server: {
      deps: {
        inline: ['wouter', 'use-sync-external-store'],
      },
    },
  },
}));