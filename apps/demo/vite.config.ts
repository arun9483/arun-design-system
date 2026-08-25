import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Served from a repo subpath on GitHub Pages; harmless elsewhere.
  base: process.env.DEMO_BASE ?? '/',
});
