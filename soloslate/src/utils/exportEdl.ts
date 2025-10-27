import { Shot } from '../store';

function buildLine(shot: Shot, take: number, ok: boolean | null, ts: string) {
  const status = ok === null ? 'UNKNOWN' : ok ? 'OK' : 'NG';
  return `* SCENE ${shot.scene} SHOT ${shot.shot} TAKE ${take} ${status} @ ${ts}`;
}

export function downloadEdl(shots: Shot[]) {
  if (!shots.length) return;
  const lines: string[] = ['TITLE: SoloSlate Export'];
  shots.forEach((shot) => {
    if (!shot.takes.length) {
      lines.push(`* SCENE ${shot.scene} SHOT ${shot.shot} TAKE 0 TODO`);
    }
    shot.takes.forEach((take) => {
      lines.push(buildLine(shot, take.n, take.ok, take.ts));
    });
    shot.notes.forEach((note) => {
      lines.push(`* NOTE: ${note}`);
    });
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'soloslate-export.edl.txt';
  anchor.click();
  URL.revokeObjectURL(url);
}
