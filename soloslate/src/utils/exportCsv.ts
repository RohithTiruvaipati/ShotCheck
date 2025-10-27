import Papa from 'papaparse';
import { Shot } from '../store';

export function downloadCsv(shots: Shot[]) {
  if (!shots.length) return;
  const rows = shots.map((shot) => {
    const lastTake = shot.takes.at(-1);
    return {
      id: shot.id,
      scene: shot.scene,
      shot: shot.shot,
      description: shot.desc,
      lens: shot.lens ?? '',
      framing: shot.framing ?? '',
      completed: shot.completed ? 'YES' : 'NO',
      takes: shot.takes.length,
      lastTakeNumber: lastTake?.n ?? '',
      lastTakeOk: lastTake?.ok ?? '',
      noteCount: shot.notes.length,
      lastTakeTimestamp: lastTake?.ts ?? '',
    };
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'soloslate-export.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
