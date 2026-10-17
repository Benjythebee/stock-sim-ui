import { useSyncExternalStore } from 'react';

/** Live result of a CSS media query, e.g. `useMediaQuery('(min-width: 1024px)')`. */
export const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );

/** Tailwind's `lg` breakpoint, where the room switches to the two-column desktop layout. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
