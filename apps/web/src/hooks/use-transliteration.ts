'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import {
  transliteratePrecedingWord,
  transliterateText,
} from '@/lib/transliterate-engine';

export interface UseTransliterationOptions {
  /** If provided, overrides default language-based activation */
  enabled?: boolean;
  /** Callback fired whenever transliteration updates the value */
  onTransliterate?: (newValue: string) => void;
  /** Debounce delay in ms for "after typing" transliteration (default: 320ms) */
  debounceMs?: number;
}

export function useTransliteration({
  enabled: controlledEnabled,
  onTransliterate,
  debounceMs = 320,
}: UseTransliterationOptions = {}) {
  const { lang, isEn } = useLanguage();
  const [internalEnabled, setInternalEnabled] = useState<boolean>(!isEn);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync default enabled state when language changes (active for mr and hi, inactive for en)
  useEffect(() => {
    if (controlledEnabled === undefined) {
      setInternalEnabled(lang === 'mr' || lang === 'hi');
    }
  }, [lang, controlledEnabled]);

  const active = controlledEnabled !== undefined ? controlledEnabled : internalEnabled;

  const toggle = useCallback(() => {
    setInternalEnabled((prev) => !prev);
  }, []);

  /**
   * Translates immediately on word boundaries (Space, Enter, punctuation)
   */
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      currentValue: string,
      setValue: (val: string) => void
    ) => {
      // Toggle shortcut: Ctrl + G
      if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        toggle();
        return;
      }

      if (!active) return;

      const triggerKeys = [' ', 'Enter', ',', '.', ';', ':', '!', '?'];
      if (!triggerKeys.includes(e.key)) return;

      const target = e.currentTarget;
      const cursorPos = target.selectionStart ?? currentValue.length;

      const res = transliteratePrecedingWord(currentValue, cursorPos);
      if (res.replaced) {
        e.preventDefault();
        // Insert transliterated word + the trigger key
        const insertedKey = e.key === 'Enter' ? '\n' : e.key;
        const finalValue =
          res.newValue.slice(0, res.newCursorPos) +
          insertedKey +
          res.newValue.slice(res.newCursorPos);
        const nextCursorPos = res.newCursorPos + insertedKey.length;

        setValue(finalValue);
        onTransliterate?.(finalValue);

        requestAnimationFrame(() => {
          target.setSelectionRange(nextCursorPos, nextCursorPos);
        });
      }
    },
    [active, onTransliterate, toggle]
  );

  /**
   * Handles input changes, mobile touch keyboards, and debounced auto-transliterate
   */
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      setValue: (val: string) => void
    ) => {
      const val = e.target.value;
      const target = e.target;
      const cursorPos = target.selectionStart ?? val.length;

      // Check if user on mobile typed a space or punctuation after a Latin word
      if (active && cursorPos > 1) {
        const charJustTyped = val[cursorPos - 1];
        if (charJustTyped === ' ' || charJustTyped === ',' || charJustTyped === '.') {
          const res = transliteratePrecedingWord(val, cursorPos - 1);
          if (res.replaced) {
            const finalValue =
              res.newValue.slice(0, res.newCursorPos) +
              charJustTyped +
              res.newValue.slice(res.newCursorPos);
            const nextCursorPos = res.newCursorPos + 1;

            setValue(finalValue);
            onTransliterate?.(finalValue);

            requestAnimationFrame(() => {
              target.setSelectionRange(nextCursorPos, nextCursorPos);
            });
            return;
          }
        }
      }

      setValue(val);

      // Debounced "after typing" transliteration
      if (active && /[a-zA-Z]/.test(val)) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          const transliterated = transliterateText(val);
          if (transliterated !== val) {
            setValue(transliterated);
            onTransliterate?.(transliterated);
          }
        }, debounceMs);
      }
    },
    [active, debounceMs, onTransliterate]
  );

  /**
   * Guarantees all remaining Latin text is transliterated upon blur
   */
  const handleBlur = useCallback(
    (
      currentValue: string,
      setValue: (val: string) => void
    ) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (!active || !/[a-zA-Z]/.test(currentValue)) return;

      const transliterated = transliterateText(currentValue);
      if (transliterated !== currentValue) {
        setValue(transliterated);
        onTransliterate?.(transliterated);
      }
    },
    [active, onTransliterate]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return {
    active,
    toggle,
    setActive: setInternalEnabled,
    handleKeyDown,
    handleChange,
    handleBlur,
    lang,
  };
}
