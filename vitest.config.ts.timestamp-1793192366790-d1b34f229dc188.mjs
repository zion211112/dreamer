// vitest.config.ts
import { defineConfig as defineConfig2, mergeConfig } from "file:///home/zion/projects/dreamer/node_modules/vitest/dist/config.js";

// vite.config.ts
import { defineConfig } from "file:///home/zion/projects/dreamer/node_modules/vite/dist/node/index.js";
import preact from "file:///home/zion/projects/dreamer/node_modules/@preact/preset-vite/dist/esm/index.mjs";
var vite_config_default = defineConfig({
  plugins: [preact()],
  root: ".",
  build: {
    outDir: "dist",
    sourcemap: true
  },
  server: {
    port: 3e3,
    open: true
  }
});

// vitest.config.ts
var vitest_config_default = mergeConfig(vite_config_default, defineConfig2({
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react-dom/test-utils": "preact/test-utils"
    }
  },
  optimizeDeps: {
    include: ["wouter", "use-sync-external-store"]
  },
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    server: {
      deps: {
        inline: ["wouter", "use-sync-external-store"]
      }
    }
  }
}));
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ppb24vcHJvamVjdHMvZHJlYW1lclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvemlvbi9wcm9qZWN0cy9kcmVhbWVyL3ZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvemlvbi9wcm9qZWN0cy9kcmVhbWVyL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIG1lcmdlQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZyc7XG5pbXBvcnQgcHJlYWN0IGZyb20gJ0BwcmVhY3QvcHJlc2V0LXZpdGUnO1xuaW1wb3J0IHZpdGVDb25maWcgZnJvbSAnLi92aXRlLmNvbmZpZyc7XG5cbmV4cG9ydCBkZWZhdWx0IG1lcmdlQ29uZmlnKHZpdGVDb25maWcsIGRlZmluZUNvbmZpZyh7XG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ3JlYWN0JzogJ3ByZWFjdC9jb21wYXQnLFxuICAgICAgJ3JlYWN0LWRvbSc6ICdwcmVhY3QvY29tcGF0JyxcbiAgICAgICdyZWFjdC9qc3gtcnVudGltZSc6ICdwcmVhY3QvanN4LXJ1bnRpbWUnLFxuICAgICAgJ3JlYWN0LWRvbS90ZXN0LXV0aWxzJzogJ3ByZWFjdC90ZXN0LXV0aWxzJyxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3dvdXRlcicsICd1c2Utc3luYy1leHRlcm5hbC1zdG9yZSddLFxuICB9LFxuICB0ZXN0OiB7XG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgc2V0dXBGaWxlczogWydzcmMvdGVzdC9zZXR1cC50cyddLFxuICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoudGVzdC57dHMsdHN4fSddLFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgc2VydmVyOiB7XG4gICAgICBkZXBzOiB7XG4gICAgICAgIGlubGluZTogWyd3b3V0ZXInLCAndXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUnXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pKTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3ppb24vcHJvamVjdHMvZHJlYW1lclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvemlvbi9wcm9qZWN0cy9kcmVhbWVyL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3ppb24vcHJvamVjdHMvZHJlYW1lci92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHByZWFjdCBmcm9tICdAcHJlYWN0L3ByZXNldC12aXRlJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3ByZWFjdCgpXSxcbiAgcm9vdDogJy4nLFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMCxcbiAgICBvcGVuOiB0cnVlLFxuICB9LFxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF1USxTQUFTLGdCQUFBQSxlQUFjLG1CQUFtQjs7O0FDQTlDLFNBQVMsb0JBQW9CO0FBQ2hTLE9BQU8sWUFBWTtBQUVuQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsT0FBTyxDQUFDO0FBQUEsRUFDbEIsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzs7O0FEVkQsSUFBTyx3QkFBUSxZQUFZLHFCQUFZQyxjQUFhO0FBQUEsRUFDbEQsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsU0FBUztBQUFBLE1BQ1QsYUFBYTtBQUFBLE1BQ2IscUJBQXFCO0FBQUEsTUFDckIsd0JBQXdCO0FBQUEsSUFDMUI7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsVUFBVSx5QkFBeUI7QUFBQSxFQUMvQztBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsWUFBWSxDQUFDLG1CQUFtQjtBQUFBLElBQ2hDLFNBQVMsQ0FBQyx3QkFBd0I7QUFBQSxJQUNsQyxTQUFTO0FBQUEsSUFDVCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsUUFDSixRQUFRLENBQUMsVUFBVSx5QkFBeUI7QUFBQSxNQUM5QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQyxDQUFDOyIsCiAgIm5hbWVzIjogWyJkZWZpbmVDb25maWciLCAiZGVmaW5lQ29uZmlnIl0KfQo=
