import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { parseIntent, Intent } from '../utils/parseIntent';
import { pushToast } from '../utils/toast';

type RecognitionCtor = new () => RecognitionInstance;

type RecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: RecognitionCtor;
    SpeechRecognition?: RecognitionCtor;
  }
}

type SpeechState = {
  listening: boolean;
  supported: boolean;
  transcript: string;
  lastIntent: Intent | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
};

export function useSpeech(): SpeechState {
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastIntent, setLastIntent] = useState<Intent | null>(null);

  const dispatchIntent = useCallback((intent: Intent | null) => {
    if (!intent) return;
    const state = useAppStore.getState();
    switch (intent.type) {
      case 'new-take':
        state.newTake(intent.payload?.index);
        pushToast('New take logged');
        break;
      case 'mark-take':
        state.markTake(intent.payload.ok, intent.payload.index);
        pushToast(intent.payload.ok ? 'Take marked good' : 'Take marked bad');
        break;
      case 'complete-shot':
        if (typeof intent.payload?.index === 'number') {
          state.completeShot(intent.payload.index);
          state.setActiveIndex(intent.payload.index);
        } else {
          state.completeShot();
        }
        pushToast('Shot marked complete');
        break;
      case 'note':
        state.addNote(intent.payload.text, intent.payload.index);
        pushToast('Note captured');
        break;
      case 'navigate':
        state.setActiveIndex(
          Math.min(
            Math.max(state.activeIndex + intent.payload.step, 0),
            Math.max(state.shots.length - 1, 0)
          )
        );
        pushToast(intent.payload.step > 0 ? 'Next shot' : 'Previous shot');
        break;
      case 'set-lens':
        state.setMeta({ lens: intent.payload.lens }, intent.payload.index);
        pushToast(`Lens set to ${intent.payload.lens}`);
        break;
      case 'set-framing':
        state.setMeta({ framing: intent.payload.framing }, intent.payload.index);
        pushToast(`Framing ${intent.payload.framing}`);
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionImpl =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) return;
    setSupported(true);
    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: Event) => {
      const speechEvent = event as SpeechRecognitionEvent;
      const { results } = speechEvent;
      if (!results.length) return;
      const last = results[results.length - 1];
      const text = last?.[0]?.transcript?.trim();
      if (!text) return;
      setTranscript(text);
      const intent = parseIntent(text, useAppStore.getState());
      setLastIntent(intent);
      dispatchIntent(intent);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [dispatchIntent]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
    } else {
      start();
    }
  }, [listening, start, stop]);

  return {
    listening,
    supported,
    transcript,
    lastIntent,
    start,
    stop,
    toggle,
  };
}
