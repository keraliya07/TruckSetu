const DEFAULT_TTL_MS = 30 * 1000;

const serializeKey = (keyParts) =>
  Array.isArray(keyParts)
    ? keyParts
        .map((part) => {
          if (part == null) {
            return 'null';
          }

          if (typeof part === 'string') {
            return part;
          }

          return JSON.stringify(part);
        })
        .join('::')
    : String(keyParts);

class TtlCache {
  constructor(defaultTtlMs = DEFAULT_TTL_MS) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
  }

  get(keyParts) {
    const key = serializeKey(keyParts);
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(keyParts, value, ttlMs = this.defaultTtlMs) {
    const key = serializeKey(keyParts);
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });

    return value;
  }

  delete(keyParts) {
    this.store.delete(serializeKey(keyParts));
  }

  async getOrSet(keyParts, loader, ttlMs = this.defaultTtlMs) {
    const key = serializeKey(keyParts);
    const now = Date.now();
    const existing = this.store.get(key);

    if (existing?.value != null && existing.expiresAt > now) {
      return existing.value;
    }

    if (existing?.pending) {
      return existing.pending;
    }

    const pending = Promise.resolve()
      .then(loader)
      .then((value) => {
        this.store.set(key, {
          value,
          expiresAt: Date.now() + ttlMs,
        });
        return value;
      })
      .catch((error) => {
        this.store.delete(key);
        throw error;
      });

    this.store.set(key, {
      pending,
      expiresAt: now + ttlMs,
      value: null,
    });

    return pending;
  }
}

module.exports = {
  TtlCache,
  serializeKey,
};
