import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_OPENSKY_PROXY_TARGET || 'https://opensky-network.org';

  return {
    plugins: [react()],
    server: {
      host: true,
      proxy: {
        '/api/openskies': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openskies/, '/api')
        }
      }
    },
    preview: {
      host: true
    },
    build: {
      sourcemap: true,
      target: 'es2022'
    }
  };
});
