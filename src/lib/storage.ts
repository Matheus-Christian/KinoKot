import type { UserSession } from './types';

const STORAGE_KEY = 'kinokott_user_session';
const SOUND_KEY = 'kinokott_sound_enabled';

export function getStoredSession(): UserSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.userId && parsed.nickname) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading session from localStorage', e);
  }

  // Fallback / default guest comrade session
  const defaultSession: UserSession = {
    userId: crypto.randomUUID ? crypto.randomUUID() : 'user_' + Math.random().toString(36).substring(2, 9),
    nickname: 'Camarada ' + Math.floor(10 + Math.random() * 90),
    avatar: 'cat-ushanka',
  };

  saveSession(defaultSession);
  return defaultSession;
}

export function saveSession(session: UserSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving session', e);
  }
}

export function getSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== 'false';
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_KEY, enabled ? 'true' : 'false');
}
