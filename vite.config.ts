import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            hymns: path.resolve(__dirname, 'hymns.html'),
            gifts: path.resolve(__dirname, 'gifts.html'),
            'other-apps': path.resolve(__dirname, 'other-apps.html'),
            'service-data': path.resolve(__dirname, 'service-data.html'),
            trombetas: path.resolve(__dirname, 'trombetas.html'),
            'guest-list': path.resolve(__dirname, 'guest-list.html'),
            prayer: path.resolve(__dirname, 'prayer.html'),
            chat: path.resolve(__dirname, 'chat.html'),
            login: path.resolve(__dirname, 'login.html'),
            settings: path.resolve(__dirname, 'settings.html')
          }
        }
      }
    };
});
