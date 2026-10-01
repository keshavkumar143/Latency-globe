import { useEffect } from 'react';

/** Calls `onEscape` when the user presses Escape. */
export function useEscapeKey(onEscape) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEscape]);
}
