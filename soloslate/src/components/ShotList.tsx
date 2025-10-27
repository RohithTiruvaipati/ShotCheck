import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Shot, useAppStore } from '../store';

const filters = [
  { label: 'All', predicate: () => true },
  { label: 'Pending', predicate: (shot: Shot) => !shot.completed },
  { label: 'Done', predicate: (shot: Shot) => shot.completed },
];

export function ShotList() {
  const shots = useAppStore((state) => state.shots);
  const activeIndex = useAppStore((state) => state.activeIndex);
  const setActiveIndex = useAppStore((state) => state.setActiveIndex);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(filters[0]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return shots
      .map((shot, index) => ({ shot, index }))
      .filter(({ shot }) => filter.predicate(shot))
      .filter(({ shot }) =>
        q.length === 0
          ? true
          : [shot.desc, shot.scene, shot.shot, shot.id]
              .join(' ')
              .toLowerCase()
              .includes(q)
      );
  }, [shots, query, filter]);

  return (
    <aside className="flex h-full flex-col gap-4 overflow-hidden">
      <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 shadow">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
            placeholder="Search shots…"
          />
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
            value={filter.label}
            onChange={(event) => {
              const next = filters.find((item) => item.label === event.target.value);
              setFilter(next ?? filters[0]);
            }}
          >
            {filters.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ol className="flex-1 space-y-2 overflow-y-auto pr-1">
        {filtered.map(({ shot, index }) => {
          const isActive = index === activeIndex;
          return (
            <li key={shot.id}>
              <button
                onClick={() => setActiveIndex(index)}
                className={clsx(
                  'w-full rounded-xl border px-3 py-2 text-left text-sm transition',
                  isActive
                    ? 'border-brand-500 bg-brand-500/20 text-slate-100 shadow'
                    : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-brand-500 hover:bg-slate-800/60 hover:text-slate-100'
                )}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                  <span>{shot.id}</span>
                  <span>{shot.completed ? 'Done' : 'Pending'}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-100">{shot.desc}</p>
                <p className="text-xs text-slate-400">
                  Scene {shot.scene} · Shot {shot.shot}
                </p>
              </button>
            </li>
          );
        })}
        {!filtered.length && (
          <p className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 px-4 py-6 text-center text-sm text-slate-500">
            No shots yet. Import a CSV to get rolling.
          </p>
        )}
      </ol>
    </aside>
  );
}
