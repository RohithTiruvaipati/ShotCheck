import { useEffect, useRef, useState } from 'react';
import { ShotCard } from './components/ShotCard';
import { ShotList } from './components/ShotList';
import { VoiceConsole } from './components/VoiceConsole';
import { Toolbar } from './components/Toolbar';
import { ImportCsv } from './components/ImportCsv';
import { useStoreHydration } from './hooks/useLocalStorage';
import { useAppStore } from './store';
import { pushToast, subscribeToToast } from './utils/toast';

export default function App() {
  const hydrated = useStoreHydration();
  const newTake = useAppStore((state) => state.newTake);
  const markTake = useAppStore((state) => state.markTake);
  const addNote = useAppStore((state) => state.addNote);
  const setActiveIndex = useAppStore((state) => state.setActiveIndex);
  const activeIndex = useAppStore((state) => state.activeIndex);
  const shots = useAppStore((state) => state.shots);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToToast((message) => {
      setToast(message);
      if (toastTimeout.current) {
        window.clearTimeout(toastTimeout.current);
      }
      toastTimeout.current = window.setTimeout(() => {
        setToast(null);
        toastTimeout.current = null;
      }, 2500);
    });
    return () => {
      unsubscribe();
      if (toastTimeout.current) {
        window.clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        newTake();
        pushToast('New take logged');
      }

      if (event.key.toLowerCase() === 'g') {
        event.preventDefault();
        if (!shots[activeIndex]?.takes.length) {
          pushToast('Log a take first');
          return;
        }
        markTake(true);
        pushToast('Take marked good');
      }

      if (event.key.toLowerCase() === 'b') {
        event.preventDefault();
        if (!shots[activeIndex]?.takes.length) {
          pushToast('Log a take first');
          return;
        }
        markTake(false);
        pushToast('Take marked bad');
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        const text = window.prompt('Note for this shot?');
        if (text) {
          addNote(text);
          pushToast('Note added');
        }
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const next = Math.min(activeIndex + 1, Math.max(shots.length - 1, 0));
        setActiveIndex(next);
        pushToast('Next shot');
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        setActiveIndex(prev);
        pushToast('Previous shot');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addNote, activeIndex, markTake, newTake, setActiveIndex, shots]);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6">
      <Toolbar />
      <ImportCsv />
      <main className="grid flex-1 gap-4 lg:grid-cols-[320px,1fr]">
        {hydrated ? (
          <>
            <ShotList />
            <ShotCard />
          </>
        ) : (
          <div className="col-span-full flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        )}
      </main>
      <VoiceConsole />
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center">
          <div className="pointer-events-auto rounded-full bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-100 shadow-xl">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
