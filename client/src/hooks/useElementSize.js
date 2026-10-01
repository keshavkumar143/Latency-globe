import { useEffect, useState } from 'react';

/**
 * Tracks an element's rendered size. Returns a callback ref to attach to the element.
 * @returns {[(element: HTMLElement | null) => void, { width: number, height: number }]}
 */
export function useElementSize() {
  const [element, setElement] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!element) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [setElement, size];
}
