import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Take = {
  n: number;
  ok: boolean | null;
  note?: string;
  ts: string;
};

export type Shot = {
  id: string;
  scene: string;
  shot: string;
  desc: string;
  lens?: string;
  framing?: 'WIDE' | 'MED' | 'CU';
  iso?: number;
  completed: boolean;
  takes: Take[];
  notes: string[];
};

const INITIAL_STATE = {
  shots: [] as Shot[],
  activeIndex: 0,
  lastTakeStamp: 0,
};

export type AppState = typeof INITIAL_STATE & {
  setShots(shots: Shot[]): void;
  setActiveIndex(index: number): void;
  completeShot(index?: number): void;
  newTake(index?: number): void;
  markTake(ok: boolean, index?: number): void;
  addNote(text: string, index?: number): void;
  setMeta(partial: Partial<Shot>, index?: number): void;
  reset(): void;
};

function clampIndex(index: number, shots: Shot[]): number {
  if (!shots.length) {
    return 0;
  }
  return Math.max(0, Math.min(index, shots.length - 1));
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      setShots(shots) {
        set(() => ({
          shots,
          activeIndex: clampIndex(get().activeIndex, shots),
        }));
      },
      setActiveIndex(index) {
        set((state) => ({
          activeIndex: clampIndex(index, state.shots),
        }));
      },
      completeShot(index) {
        set((state) => {
          const target = index ?? state.activeIndex;
          if (!state.shots[target]) return {};
          const shots = state.shots.map((shot, i) =>
            i === target ? { ...shot, completed: true } : shot
          );
          return { shots };
        });
      },
      newTake(index) {
        set((state) => {
          const now = Date.now();
          if (now - state.lastTakeStamp < 500) {
            return {};
          }
          const target = index ?? state.activeIndex;
          const shot = state.shots[target];
          if (!shot) return {};
          const nextTake: Take = {
            n: shot.takes.length + 1,
            ok: null,
            ts: new Date().toISOString(),
          };
          const shots = state.shots.map((item, i) =>
            i === target ? { ...item, takes: [...item.takes, nextTake] } : item
          );
          return { shots, lastTakeStamp: now };
        });
      },
      markTake(ok, index) {
        set((state) => {
          const target = index ?? state.activeIndex;
          const shot = state.shots[target];
          if (!shot || shot.takes.length === 0) return {};
          const shots = state.shots.map((item, i) => {
            if (i !== target) return item;
            const takes = item.takes.map((take, idx) =>
              idx === item.takes.length - 1 ? { ...take, ok } : take
            );
            return { ...item, takes };
          });
          return { shots };
        });
      },
      addNote(text, index) {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((state) => {
          const target = index ?? state.activeIndex;
          if (!state.shots[target]) return {};
          const entry = `${new Date().toISOString()} — ${trimmed}`;
          const shots = state.shots.map((item, i) =>
            i === target ? { ...item, notes: [...item.notes, entry] } : item
          );
          return { shots };
        });
      },
      setMeta(partial, index) {
        set((state) => {
          const target = index ?? state.activeIndex;
          if (!state.shots[target]) return {};
          const shots = state.shots.map((item, i) =>
            i === target ? { ...item, ...partial } : item
          );
          return { shots };
        });
      },
      reset() {
        set(() => ({ ...INITIAL_STATE }));
      },
    }),
    {
      name: 'soloslate:v1',
      partialize: ({ shots, activeIndex }) => ({ shots, activeIndex }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          set(() => ({ ...INITIAL_STATE }));
        }
      },
    }
  )
);

export const selectors = {
  shots: (state: AppState) => state.shots,
  activeIndex: (state: AppState) => state.activeIndex,
};
