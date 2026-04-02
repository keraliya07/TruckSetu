const STORAGE_KEY = 'stlos-auth';

export function readStoredAuth() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function mergeStoredAuth(partialState) {
  if (typeof window === 'undefined') {
    return null;
  }

  const current = readStoredAuth() || { state: {}, version: 0 };
  const next = {
    ...current,
    state: {
      ...current.state,
      ...partialState,
    },
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export { STORAGE_KEY };
