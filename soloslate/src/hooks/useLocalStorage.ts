import { useEffect, useState } from 'react';
import { useAppStore } from '../store';

export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useAppStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinish(() => setHydrated(true));
    if (persist.hasHydrated()) {
      setHydrated(true);
    }
    return () => {
      unsub();
    };
  }, []);

  return hydrated;
}
