import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/guerrilla': {
        target: 'https://api.guerrillamail.com/ajax.php',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/guerrilla/, ''),
      },
      '/api/maildrop': {
        target: 'https://api.maildrop.cc/graphql',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/maildrop/, ''),
      },
    },
  },
});
