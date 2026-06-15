import { useCallback, useRef, useState } from 'react';

const CONTACT_TOGGLE_DEBOUNCE_MS = 320;

export function useContactExpandedToggle(hasContact: boolean) {
  const [expanded, setExpanded] = useState(false);
  const lastToggleAtRef = useRef(0);

  const toggle = useCallback(() => {
    if (!hasContact) return;
    const now = Date.now();
    if (now - lastToggleAtRef.current < CONTACT_TOGGLE_DEBOUNCE_MS) return;
    lastToggleAtRef.current = now;
    setExpanded((value) => !value);
  }, [hasContact]);

  return { expanded, toggle };
}
