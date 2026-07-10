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
            home: path.resolve(__dirname, 'home.html'), // Adicionado com sucesso!
            login: path.resolve(__dirname, 'login.html'),
            hymns: path.resolve(__dirname, 'hymns.html'),
            prayer: path.resolve(__dirname, 'prayer.html'),
            'guest-list': path.resolve(__dirname, 'guest-list.html'),
            'service-data': path.resolve(__dirname, 'service-data.html'),
            'service-attendance': path.resolve(__dirname, 'service-attendance.html'), // Adicionado com sucesso!
            settings: path.resolve(__dirname, 'settings.html'),
            'other-apps': path.resolve(__dirname, 'other-apps.html'),
            'trombetas-invitation': path.resolve(__dirname, 'trombetas-invitation.html'), // Adicionado com sucesso!
            gifts: path.resolve(__dirname, 'gifts.html'),
            trombetas: path.resolve(__dirname, 'trombetas.html'),
            chat: path.resolve(__dirname, 'chat.html')
          }
        }
      }
    };
});