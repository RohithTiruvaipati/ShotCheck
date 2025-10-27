import { useCsv } from '../hooks/useCsv';
import { useAppStore } from '../store';
import { pushToast } from '../utils/toast';

export function Toolbar() {
  const { exportCsv, exportEdl } = useCsv();
  const reset = useAppStore((state) => state.reset);
  const shots = useAppStore((state) => state.shots);

  const completed = shots.filter((shot) => shot.completed).length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow">
      <div>
        <p className="text-sm font-semibold text-slate-200">SoloSlate</p>
        <p className="text-xs text-slate-500">
          {completed}/{shots.length} shots complete · autosaving to your browser
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-brand-500 hover:text-brand-400"
          onClick={exportCsv}
          disabled={!shots.length}
        >
          Export CSV
        </button>
        <button
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-brand-500 hover:text-brand-400"
          onClick={exportEdl}
          disabled={!shots.length}
        >
          Export EDL-lite
        </button>
        <button
          className="rounded-lg border border-rose-700 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-600/20"
          onClick={() => {
            if (window.confirm('Reset all shots, takes, and notes?')) {
              reset();
              pushToast('Workspace reset');
            }
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
