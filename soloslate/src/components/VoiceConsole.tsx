import clsx from 'clsx';
import { useSpeech } from '../hooks/useSpeech';

function intentLabel(intentType: string | null) {
  switch (intentType) {
    case 'new-take':
      return 'New Take';
    case 'mark-take':
      return 'Mark Take';
    case 'complete-shot':
      return 'Complete Shot';
    case 'note':
      return 'Note';
    case 'navigate':
      return 'Navigate';
    case 'set-lens':
      return 'Set Lens';
    case 'set-framing':
      return 'Set Framing';
    default:
      return '—';
  }
}

export function VoiceConsole() {
  const { listening, supported, transcript, lastIntent, toggle } = useSpeech();

  return (
    <aside className="sticky bottom-0 mt-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Voice Console</p>
          <p className="text-sm text-slate-300">
            {supported
              ? listening
                ? 'Listening… say “new take”, “mark good”, “note boom in frame”…'
                : 'Tap mic to start hands-free control.'
              : 'Speech recognition not supported in this browser.'}
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={!supported}
          className={clsx(
            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
            supported
              ? listening
                ? 'bg-rose-600 text-white shadow hover:bg-rose-500'
                : 'bg-emerald-600 text-white shadow hover:bg-emerald-500'
              : 'bg-slate-800 text-slate-500'
          )}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-current"></span>
          {supported ? (listening ? 'Stop' : 'Start Mic') : 'Unavailable'}
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500">Last Transcript</p>
          <p className="mt-1 min-h-[1.5rem]">{transcript || '—'}</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-wide text-slate-500">Last Intent</p>
          <p className="mt-1 font-semibold text-brand-200">{intentLabel(lastIntent?.type ?? null)}</p>
        </div>
      </div>
    </aside>
  );
}
