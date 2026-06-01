import { useCallback, useRef } from 'react';
import {
  createTypewriterReveal,
  type TypewriterReveal,
} from '../../utils/typewriterReveal';

export interface UseTypewriterReplyOptions {
  charDelayMs?: number;
  onUpdate: (visible: string) => void;
}

export function useTypewriterReply() {
  const typewriterRef = useRef<TypewriterReveal | null>(null);

  const createTypewriter = useCallback((options: UseTypewriterReplyOptions) => {
    const typewriter = createTypewriterReveal({
      charDelayMs: options.charDelayMs,
      onUpdate: options.onUpdate,
    });
    typewriterRef.current = typewriter;
    return typewriter;
  }, []);

  const getActiveTypewriter = useCallback(() => typewriterRef.current, []);

  return { createTypewriter, getActiveTypewriter };
}
