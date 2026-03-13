"use client";

import { useEffect, useRef } from "react";

interface ShortcutOptions {
  /** The key to listen for (e.g. "k", "s", "Escape") */
  key: string;
  /** Require meta (Cmd on Mac, Ctrl on Windows) */
  meta?: boolean;
  /** Require shift */
  shift?: boolean;
  /** Require alt/option */
  alt?: boolean;
  /** Callback when shortcut is triggered */
  handler: () => void;
  /** Whether the shortcut is currently active (default: true) */
  enabled?: boolean;
  /** Prevent default browser behaviour (default: true) */
  preventDefault?: boolean;
}

function useKeyboardShortcut({
  key,
  meta = false,
  shift = false,
  alt = false,
  handler,
  enabled = true,
  preventDefault = true,
}: ShortcutOptions): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent): void {
      // Don't fire shortcuts when typing in inputs, textareas, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Exception: allow meta+key shortcuts even in inputs (like Cmd+S, Cmd+K)
        if (!meta) return;
      }

      const metaMatch = meta ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey;
      const shiftMatch = shift ? e.shiftKey : !e.shiftKey;
      const altMatch = alt ? e.altKey : !e.altKey;
      const keyMatch = e.key.toLowerCase() === key.toLowerCase();

      if (metaMatch && shiftMatch && altMatch && keyMatch) {
        if (preventDefault) {
          e.preventDefault();
        }
        handlerRef.current();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [key, meta, shift, alt, enabled, preventDefault]);
}

function useKeyboardShortcuts(shortcuts: ShortcutOptions[]): void {
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        // Skip non-meta shortcuts when in inputs
        if (inInput && !shortcut.meta) continue;

        const metaMatch = shortcut.meta
          ? e.metaKey || e.ctrlKey
          : !e.metaKey && !e.ctrlKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (metaMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler();
          return;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}

export { useKeyboardShortcut, useKeyboardShortcuts, type ShortcutOptions };
