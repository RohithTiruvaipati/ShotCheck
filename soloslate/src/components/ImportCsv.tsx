import { ChangeEvent, useRef } from 'react';
import { useCsv } from '../hooks/useCsv';

export function ImportCsv() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { importFile, importSample, loading, error } = useCsv();

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await importFile(file);
    event.target.value = '';
  };

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-100">Import Shot List</h2>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-600 px-3 py-1 text-sm font-medium text-slate-200 transition hover:border-brand-500 hover:text-brand-500"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Upload CSV'}
          </button>
          <button
            className="rounded-lg bg-brand-700 px-3 py-1 text-sm font-semibold text-white shadow hover:bg-brand-500"
            onClick={importSample}
            disabled={loading}
          >
            Try Sample
          </button>
        </div>
      </header>
      <p className="text-sm text-slate-400">
        CSV columns: <code>scene</code>, <code>shot</code>, <code>desc</code>, optional <code>lens</code>, <code>framing</code>.
      </p>
      {error && <p className="mt-3 rounded bg-red-900/40 px-3 py-2 text-sm text-red-200">{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onFileChange}
      />
    </section>
  );
}
