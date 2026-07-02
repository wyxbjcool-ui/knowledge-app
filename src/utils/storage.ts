const PREFIX = 'kp_';

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('存储失败，可能空间已满:', e);
  }
}

export function removeKey(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function getAllKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) {
      keys.push(k.slice(PREFIX.length));
    }
  }
  return keys;
}
