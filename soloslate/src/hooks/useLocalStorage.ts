import { useEffect, useState } from 'react';
import { useAppStore } from '../store';

export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = (useAppStore as typeof useAppStore & {
      persist?: {
        hasHydrated?: () => boolean;
        onFinish?: (cb: () => void) => () => void;
        onHydrate?: (cb: () => void) => () => void;
      };
    }).persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    const unsubHydrate = persist.onHydrate?.(() => setHydrated(false));
    const unsubFinish = persist.onFinish?.(() => setHydrated(true));

    if (persist.hasHydrated?.()) {
      setHydrated(true);
    } else if (!persist.onFinish) {
      setHydrated(true);
    }

    return () => {
      unsubHydrate?.();
      unsubFinish?.();
    };
  }, []);

  return hydrated;
}
