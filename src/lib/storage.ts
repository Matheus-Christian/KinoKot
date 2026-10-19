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

// Host Key persistence for seamless recovery of created rooms
const HOST_KEYS_STORAGE = 'kinokott_host_keys';

export function saveRoomHostKey(roomCode: string, hostKey: string): void {
  try {
    const raw = localStorage.getItem(HOST_KEYS_STORAGE);
    const keys = raw ? JSON.parse(raw) : {};
    keys[roomCode.toUpperCase()] = hostKey;
    localStorage.setItem(HOST_KEYS_STORAGE, JSON.stringify(keys));
  } catch (e) {
    console.warn('Error saving room host key', e);
  }
}

export function getRoomHostKey(roomCode: string): string | null {
  try {
    const raw = localStorage.getItem(HOST_KEYS_STORAGE);
    if (!raw) return null;
    const keys = JSON.parse(raw);
    return keys[roomCode.toUpperCase()] || null;
  } catch (e) {
    return null;
  }
}

// Active Room session persistence
const ACTIVE_ROOM_KEY = 'kinokott_active_room_code';

export function saveActiveRoomCode(roomCode: string): void {
  try {
    localStorage.setItem(ACTIVE_ROOM_KEY, roomCode.toUpperCase());
  } catch (e) {
    console.error('Error saving active room code', e);
  }
}

export function getActiveRoomCode(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ROOM_KEY);
  } catch (e) {
    return null;
  }
}

export function clearActiveRoomCode(): void {
  try {
    localStorage.removeItem(ACTIVE_ROOM_KEY);
  } catch (e) {
    console.error('Error clearing active room code', e);
  }
}
