/**
 * useLocalStorageState — Middle-Layer Hook
 *
 * Drop-in replacement for useState that persists to localStorage.
 * Degrades silently when storage is unavailable (private browsing / quota exceeded).
 * Cross-tab synchronisation via the native 'storage' event.
 *
 * Cognitive Scaffold Design System — Middle-Layer Hooks
 */
import { useState, useCallback, useEffect } from "react";

type Serializer<T> = {
  read:  (raw: string) => T;
  write: (val: T)      => string;
};

function makeSer<T>(): Serializer<T> {
  return {
    read:  (raw) => JSON.parse(raw) as T,
    write: (val) => JSON.stringify(val),
  };
}

function safeRead<T>(key: string, fallback: T, ser: Serializer<T>): T {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return raw !== null ? ser.read(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T, ser: Serializer<T>): void {
  try {
    localStorage.setItem(key, ser.write(value));
  } catch {
    /* quota exceeded or private browsing — degrade silently */
  }
}

export function useLocalStorageState<T>(
  key: string,
  initial: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const ser = makeSer<T>();
  const [state, setRaw] = useState<T>(() => safeRead(key, initial, ser));

  /* Cross-tab sync */
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try { setRaw(ser.read(e.newValue)); } catch { /* ignore malformed */ }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setState: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (action) => {
      setRaw((prev) => {
        const next =
          typeof action === "function" ? (action as (p: T) => T)(prev) : action;
        safeWrite(key, next, ser);
        return next;
      });
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [state, setState];
}
