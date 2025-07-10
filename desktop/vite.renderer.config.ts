import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '../app'), // point to existing app
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../app'),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
});