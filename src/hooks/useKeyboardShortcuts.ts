import { useEffect } from 'react';

type ShortcutHandler = () => void;

interface Shortcuts {
  f?: ShortcutHandler;
  c?: ShortcutHandler;
  escape?: ShortcutHandler;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          shortcuts.f?.();
          break;
        case 'c':
          shortcuts.c?.();
          break;
        case 'escape':
          shortcuts.escape?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
