import { ChangeEvent } from 'react';
import clsx from 'clsx';
import { Shot, useAppStore } from '../store';
import { pushToast } from '../utils/toast';

export function ShotCard() {
  const shots = useAppStore((state) => state.shots);
  const activeIndex = useAppStore((state) => state.activeIndex);
  const newTake = useAppStore((state) => state.newTake);
  const markTake = useAppStore((state) => state.markTake);
  const completeShot = useAppStore((state) => state.completeShot);
  const addNote = useAppStore((state) => state.addNote);
  const setMeta = useAppStore((state) => state.setMeta);

  const shot = shots[activeIndex];

  const onSetLens = (event: ChangeEvent<HTMLInputElement>) => {
    setMeta({ lens: event.target.value || undefined });
    if (event.target.value) {
      pushToast(`Lens set to ${event.target.value}`);
    }
  };

  const onSetFraming = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as Shot['framing'] | '';
    setMeta({ framing: value === '' ? undefined : value });
    if (value) {
      pushToast(`Framing ${value}`);
    }
  };

  const handleAddNote = () => {
    const text = window.prompt('Note for this shot?');
    if (text) {
      addNote(text);
      pushToast('Note added');
    }
  };

  if (!shot) {
    return (
      <section className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center text-slate-500">
        <p className="max-w-md text-lg font-medium">
          Import a CSV to start managing your shot list. Your takes, notes, and voice commands will show up here.
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-slate-500">{shot.id}</p>
          <h1 className="text-2xl font-semibold text-slate-100">{shot.desc}</h1>
          <p className="text-sm text-slate-400">
            Scene {shot.scene} · Shot {shot.shot}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest', shot.completed ? 'bg-emerald-600/20 text-emerald-300' : 'bg-amber-600/20 text-amber-300')}>
            {shot.completed ? 'Completed' : 'Pending'}
          </span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-slate-500">Lens</span>
          <input
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
            placeholder="24mm"
            value={shot.lens ?? ''}
            onChange={onSetLens}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-slate-500">Framing</span>
          <select
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
            value={shot.framing ?? ''}
            onChange={onSetFraming}
          >
            <option value="">—</option>
            <option value="WIDE">Wide</option>
            <option value="MED">Medium</option>
            <option value="CU">Close-Up</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-500"
          onClick={() => {
            newTake();
            pushToast('New take logged');
          }}
        >
          New Take ↵
        </button>
        <button
          className="rounded-lg border border-emerald-500/60 px-4 py-2 text-sm font-semibold text-emerald-200 hover:border-emerald-400 hover:text-emerald-100"
          onClick={() => {
            if (!shot.takes.length) {
              pushToast('Log a take first');
              return;
            }
            markTake(true);
            pushToast('Take marked good');
          }}
        >
          Mark Good (G)
        </button>
        <button
          className="rounded-lg border border-rose-500/60 px-4 py-2 text-sm font-semibold text-rose-200 hover:border-rose-400 hover:text-rose-100"
          onClick={() => {
            if (!shot.takes.length) {
              pushToast('Log a take first');
              return;
            }
            markTake(false);
            pushToast('Take marked bad');
          }}
        >
          Mark Bad (B)
        </button>
        <button
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-brand-500 hover:text-brand-400"
          onClick={handleAddNote}
        >
          Add Note (N)
        </button>
        <button
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-500 hover:text-emerald-300"
          onClick={() => {
            completeShot();
            pushToast('Shot marked complete');
          }}
        >
          Complete Shot
        </button>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Takes</h2>
          <span className="text-xs text-slate-500">{shot.takes.length || 'No'} logged</span>
        </header>
        <ol className="mt-3 space-y-2">
          {shot.takes.map((take) => (
            <li
              key={take.n}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200"
            >
              <div>
                <p className="font-semibold">
                  Take {take.n}{' '}
                  <span
                    className={clsx(
                      'ml-2 rounded-full px-2 py-0.5 text-xs font-semibold uppercase',
                      take.ok === null
                        ? 'bg-slate-700 text-slate-200'
                        : take.ok
                        ? 'bg-emerald-600/40 text-emerald-200'
                        : 'bg-rose-700/40 text-rose-200'
                    )}
                  >
                    {take.ok === null ? 'Pending' : take.ok ? 'Good' : 'Bad'}
                  </span>
                </p>
                <p className="text-xs text-slate-500">{new Date(take.ts).toLocaleString()}</p>
              </div>
            </li>
          ))}
          {!shot.takes.length && (
            <li className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-3 py-6 text-center text-sm text-slate-500">
              No takes yet. Hit “New Take” or say “new take”.
            </li>
          )}
        </ol>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Notes</h2>
          <span className="text-xs text-slate-500">{shot.notes.length || 'No'} saved</span>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {shot.notes.map((note, index) => (
            <li key={`${note}-${index}`} className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
              {note}
            </li>
          ))}
          {!shot.notes.length && (
            <li className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-3 py-6 text-center text-sm text-slate-500">
              Notes you add here or via voice will land in your export.
            </li>
          )}
        </ul>
      </section>

      <footer className="mt-auto text-xs text-slate-500">
        Keyboard: ↵ new take · G good · B bad · N note · ←/→ navigate shots
      </footer>
    </section>
  );
}
