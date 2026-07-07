import { LOGO_ICM_BASE64 } from './assets';

export interface AppSettings {
  logo: string;
  hymnHeaderType: 'text' | 'image';
  hymnHeaderText: string;
  hymnHeaderImage: string | null;
  icons: {
    hymns: string;
    gifts: string;
    other: string;
    support: string;
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  logo: LOGO_ICM_BASE64,
  hymnHeaderType: 'text',
  hymnHeaderText: 'IGREJA CRISTÃ MARANATA',
  hymnHeaderImage: null,
  icons: {
    hymns: 'fa-list-ul',
    gifts: 'fa-id-card',
    other: 'fa-th-large',
    support: 'fa-question-circle'
  }
};

export function getSettings(): AppSettings {
  const saved = localStorage.getItem('APP_SETTINGS');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao ler configurações locais:", e);
    }
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem('APP_SETTINGS', JSON.stringify(settings));
}
