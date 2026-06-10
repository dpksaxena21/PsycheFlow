import { useEffect } from 'react';

export function useKeyboardNav(setTab, tabs) {
  useEffect(() => {
    const handler = (e) => {
      // Only when no input focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (!e.altKey) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= tabs.length) {
        setTab(tabs[num - 1].id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setTab, tabs]);
}
