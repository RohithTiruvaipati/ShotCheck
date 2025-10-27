import { AppState, Shot } from '../store';
import { padScene, padShot } from './id';

export type Intent =
  | { type: 'new-take'; payload?: { index?: number } }
  | { type: 'mark-take'; payload: { ok: boolean; index?: number } }
  | { type: 'complete-shot'; payload?: { index?: number } }
  | { type: 'note'; payload: { text: string; index?: number } }
  | { type: 'navigate'; payload: { step: 1 | -1 } }
  | { type: 'set-lens'; payload: { lens: string; index?: number } }
  | { type: 'set-framing'; payload: { framing: Shot['framing']; index?: number } };

const numberWords: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

function parseNumberToken(token?: string): number | undefined {
  if (!token) return undefined;
  const sanitized = token.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (!sanitized) return undefined;
  if (numberWords[sanitized] !== undefined) {
    return numberWords[sanitized];
  }
  const numeric = Number.parseInt(sanitized, 10);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function findShotIndex(
  state: AppState,
  shotToken?: string,
  sceneToken?: string
): number | undefined {
  const shotNumber = parseNumberToken(shotToken);
  const sceneNumber = parseNumberToken(sceneToken);

  if (shotNumber === undefined && sceneNumber === undefined) {
    return undefined;
  }

  const normalizedScene =
    sceneNumber !== undefined ? padScene(sceneNumber.toString()) : undefined;
  const normalizedShot =
    shotNumber !== undefined ? padShot(shotNumber.toString()) : undefined;

  const index = state.shots.findIndex((shot) => {
    if (normalizedScene && normalizedShot) {
      return shot.scene === normalizedScene && shot.shot === normalizedShot;
    }
    if (normalizedScene) {
      return shot.scene === normalizedScene;
    }
    if (normalizedShot) {
      return shot.shot === normalizedShot;
    }
    return false;
  });

  return index >= 0 ? index : undefined;
}

function normaliseLens(raw: string): string {
  const trimmed = raw.trim();
  if (/mm$/i.test(trimmed)) return trimmed;
  return `${trimmed.replace(/[^0-9.]/g, '')}mm`;
}

function normaliseFraming(value: string): Shot['framing'] | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith('wide')) return 'WIDE';
  if (normalized.startsWith('med')) return 'MED';
  if (normalized.startsWith('close')) return 'CU';
  if (normalized === 'cu') return 'CU';
  return undefined;
}

export function parseIntent(input: string, state: AppState): Intent | null {
  const text = input.toLowerCase().trim();

  if (/new\s+take/.test(text)) {
    const match = text.match(/shot\s+(\w+)/);
    const shotIndex = findShotIndex(state, match?.[1]);
    return { type: 'new-take', payload: { index: shotIndex } };
  }

  if (/mark.+good/.test(text) || /good take/.test(text)) {
    const match = text.match(/shot\s+(\w+)/);
    const shotIndex = findShotIndex(state, match?.[1]);
    return { type: 'mark-take', payload: { ok: true, index: shotIndex } };
  }

  if (/mark.+bad/.test(text) || /bad take/.test(text)) {
    const match = text.match(/shot\s+(\w+)/);
    const shotIndex = findShotIndex(state, match?.[1]);
    return { type: 'mark-take', payload: { ok: false, index: shotIndex } };
  }

  const completeMatch = text.match(/mark.+shot\s+(\w+).+(?:done|complete)/);
  if (/complete shot/.test(text) || completeMatch) {
    const sceneMatch = text.match(/scene\s+(\w+)/);
    const shotMatch = completeMatch?.[1] ? completeMatch : text.match(/shot\s+(\w+)/);
    const index = findShotIndex(state, shotMatch?.[1], sceneMatch?.[1]);
    return { type: 'complete-shot', payload: { index } };
  }

  const noteMatch = text.match(/note(?:\s+on)?(?:\s+scene\s+(\w+))?(?:\s+shot\s+(\w+))?\s+(?:about\s+)?['"]?(.+)/);
  if (noteMatch) {
    const [, sceneToken, shotToken, content] = noteMatch;
    const index = findShotIndex(state, shotToken, sceneToken);
    return { type: 'note', payload: { text: content.trim(), index } };
  }

  if (/next\s+shot/.test(text) || /next/.test(text)) {
    return { type: 'navigate', payload: { step: 1 } };
  }

  if (/previous\s+shot/.test(text) || /prev(ious)?/.test(text)) {
    return { type: 'navigate', payload: { step: -1 } };
  }

  const lensMatch = text.match(/set\s+lens\s+([0-9.]+\s?(?:mm|millimeter|millimetre)?)/);
  if (lensMatch) {
    const shotMatch = text.match(/shot\s+(\w+)/);
    const index = findShotIndex(state, shotMatch?.[1]);
    return {
      type: 'set-lens',
      payload: { lens: normaliseLens(lensMatch[1]), index },
    };
  }

  const framingMatch = text.match(/set\s+framing\s+([a-z\s]+)/);
  if (framingMatch) {
    const framing = normaliseFraming(framingMatch[1]);
    if (framing) {
      const shotMatch = text.match(/shot\s+(\w+)/);
      const index = findShotIndex(state, shotMatch?.[1]);
      return {
        type: 'set-framing',
        payload: { framing, index },
      };
    }
  }

  return null;
}
