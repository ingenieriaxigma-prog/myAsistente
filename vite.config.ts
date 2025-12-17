import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      disable: true,
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      minify: false,

      manifest: {
        name: 'My - Salud Digital',
        short_name: 'My Asistente',
        description:
          'Plataforma de salud digital que combina IA con conocimiento médico para chat clínico y diagnóstico inteligente',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        orientation: 'portrait',
        lang: 'es-ES',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/[^/]*supabase\.co\/.*|\/(rest|auth|storage)\//,
            handler: 'NetworkOnly',
            method: 'GET',
          },
          {
            urlPattern: /.*/,
            handler: 'NetworkOnly',
            method: 'POST',
          },
          {
            urlPattern: /.*/,
            handler: 'NetworkOnly',
            method: 'PUT',
          },
          {
            urlPattern: /.*/,
            handler: 'NetworkOnly',
            method: 'DELETE',
          },
        ],
      },
    }),
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'es2018',
    outDir: 'build',
  },

  server: {
    port: 3000,
    open: true,
  },
});
