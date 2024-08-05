import localForage from 'localforage';
import { useCallback, useEffect, useState } from 'react';

localForage.config({
  name: 'genmoji',
});

export default function useLocalForage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, boolean] {
  const event = `event:${key}`;
  const [isInitialized, setIsInitialized] = useState(false);
  const [storedValue, setStoredValue] = useState(initialValue);

  const retrieve = useCallback(async () => {
    try {
      const value: T | null = await localForage.getItem(key);
      setStoredValue(value == null ? initialValue : value);
    } catch (err) {
      console.error(err);
    }
  }, [initialValue, setStoredValue, key]);

  const store = useCallback(
    async (value: T) => {
      try {
        setStoredValue(value);
        await localForage.setItem(key, value);
      } catch (err) {
        console.error(err);
      } finally {
        window.dispatchEvent(new Event(event));
      }
    },
    [key, event, setStoredValue]
  );

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    retrieve();
    setIsInitialized(true);
  }, [isInitialized, retrieve]);

  useEffect(() => {
    window.addEventListener(event, retrieve);

    return () => {
      window.removeEventListener(event, retrieve);
    };
  }, [event, retrieve]);

  return [storedValue, store, isInitialized];
}
