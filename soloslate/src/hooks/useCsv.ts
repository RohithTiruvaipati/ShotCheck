import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { Shot, useAppStore } from '../store';
import { makeShotId, padScene, padShot } from '../utils/id';
import { downloadCsv } from '../utils/exportCsv';
import { downloadEdl } from '../utils/exportEdl';
import { pushToast } from '../utils/toast';

export type CsvStatus = {
  loading: boolean;
  error: string | null;
  importFile: (file: File) => Promise<void>;
  importSample: () => Promise<void>;
  exportCsv: () => void;
  exportEdl: () => void;
};

function mapRowToShot(row: Record<string, string | number>): Shot | null {
  const scene = `${row.scene ?? row.Scene ?? row.SCENE ?? ''}`.trim();
  const shot = `${row.shot ?? row.Shot ?? row.SHOT ?? ''}`.trim();
  const desc = `${row.desc ?? row.description ?? row.Description ?? ''}`.trim();
  if (!scene || !shot || !desc) {
    return null;
  }

  const lens = `${row.lens ?? row.Lens ?? ''}`.trim() || undefined;
  const framingRaw = `${row.framing ?? row.Framing ?? ''}`.trim().toUpperCase();
  const framing =
    framingRaw === '' || !['WIDE', 'MED', 'CU'].includes(framingRaw)
      ? undefined
      : (framingRaw as Shot['framing']);

  const normalizedScene = padScene(scene);
  const normalizedShot = padShot(shot);

  return {
    id: makeShotId(normalizedScene, normalizedShot),
    scene: normalizedScene,
    shot: normalizedShot,
    desc,
    lens,
    framing,
    completed: false,
    takes: [],
    notes: [],
  };
}

async function parseCsvFile(file: File): Promise<Shot[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string | number>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const shots = result.data
          .map((row) => mapRowToShot(row))
          .filter((shot): shot is Shot => Boolean(shot));
        resolve(shots);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

async function fetchSample(): Promise<File> {
  const response = await fetch('/sample.csv');
  if (!response.ok) {
    throw new Error('Sample CSV not found');
  }
  const blob = await response.blob();
  return new File([blob], 'sample.csv', { type: 'text/csv' });
}

export function useCsv(): CsvStatus {
  const setShots = useAppStore((state) => state.setShots);
  const shots = useAppStore((state) => state.shots);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const parsed = await parseCsvFile(file);
        setShots(parsed);
        pushToast(`Imported ${parsed.length} shots`);
      } catch (err) {
        setError((err as Error).message ?? 'Failed to parse CSV');
        pushToast('CSV import failed');
      } finally {
        setLoading(false);
      }
    },
    [setShots]
  );

  const importSample = useCallback(async () => {
    try {
      const file = await fetchSample();
      await importFile(file);
    } catch (err) {
      setError('Failed to load sample CSV');
      pushToast('Sample CSV unavailable');
    }
  }, [importFile]);

  const handleExportCsv = useCallback(() => {
    downloadCsv(shots);
    pushToast('CSV exported');
  }, [shots]);

  const handleExportEdl = useCallback(() => {
    downloadEdl(shots);
    pushToast('EDL exported');
  }, [shots]);

  return {
    loading,
    error,
    importFile,
    importSample,
    exportCsv: handleExportCsv,
    exportEdl: handleExportEdl,
  };
}
