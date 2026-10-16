export function createContentCache<T>() {
  const entries = new Map<string, Promise<T>>();
  return (key: string, load: () => Promise<T>): Promise<T> => {
    const cached = entries.get(key);
    if (cached) return cached;
    const pending = Promise.resolve().then(load);
    entries.set(key, pending);
    pending.catch(() => entries.delete(key));
    return pending;
  };
}
