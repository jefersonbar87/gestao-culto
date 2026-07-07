
export enum AppMode {
  HOME = 'HOME',
  CHAT = 'CHAT',
  LIVE = 'LIVE',
  HYMN_LIST = 'HYMN_LIST',
  GIFT_REGISTRATION = 'GIFT_REGISTRATION',
  OTHER_APPS_MENU = 'OTHER_APPS_MENU',
  SERVICE_DATA = 'SERVICE_DATA',
  TROMBETAS_MENU = 'TROMBETAS_MENU',
  GUEST_LIST = 'GUEST_LIST',
  PRAYER_TIMER = 'PRAYER_TIMER',
  SETTINGS = 'SETTINGS',
  LOGIN = 'LOGIN'
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  image?: string;
  isError?: boolean;
  groundingSources?: GroundingSource[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

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
  };
}
