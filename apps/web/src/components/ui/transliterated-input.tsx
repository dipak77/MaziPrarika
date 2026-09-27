'use client';

import React, { forwardRef, useId } from 'react';
import { useTransliteration } from '@/hooks/use-transliteration';

export interface TransliteratedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onValueChange: (val: string) => void;
  /** Whether to show the phonetic typing toggle pill on the input (default: true) */
  showToggle?: boolean;
  wrapperClassName?: string;
}

export const TransliteratedInput = forwardRef<HTMLInputElement, TransliteratedInputProps>(
  (
    {
      value,
      onValueChange,
      showToggle = true,
      className = '',
      wrapperClassName = '',
      placeholder,
      onKeyDown,
      onBlur,
      ...props
    },
    ref
  ) => {
    const toggleId = useId();
    const { active, toggle, handleKeyDown, handleChange, handleBlur, lang } =
      useTransliteration({
        onTransliterate: onValueChange,
      });

    const isIndic = lang === 'mr' || lang === 'hi';

    return (
      <div className={`relative flex items-center ${wrapperClassName}`}>
        <input
          ref={ref}
          value={value}
          onChange={(e) => handleChange(e, onValueChange)}
          onKeyDown={(e) => {
            handleKeyDown(e, value, onValueChange);
            onKeyDown?.(e);
          }}
          onBlur={(e) => {
            handleBlur(value, onValueChange);
            onBlur?.(e);
          }}
          placeholder={placeholder}
          className={`${className} ${showToggle && isIndic ? 'pr-11' : ''}`}
          {...props}
        />
        {showToggle && isIndic && (
          <button
            id={toggleId}
            type="button"
            tabIndex={-1}
            onClick={toggle}
            title={
              active
                ? 'ध्वन्यात्मक लिप्यंतरण चालू (Phonetic typing ON) • बंद करण्यासाठी क्लिक करा (Ctrl+G)'
                : 'इंग्रजी टायपिंग चालू (English typing ON) • देवनागरीसाठी क्लिक करा (Ctrl+G)'
            }
            aria-label={active ? 'ध्वन्यात्मक लिप्यंतरण चालू' : 'इंग्रजी टायपिंग चालू'}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex size-7 items-center justify-center rounded-lg text-xs font-bold transition select-none cursor-pointer ${
              active
                ? 'bg-gold/25 text-maroon ring-1 ring-gold/40 hover:bg-gold/35 shadow-2xs'
                : 'bg-charcoal/10 text-charcoal-muted hover:bg-charcoal/20'
            }`}
          >
            {active ? 'अ' : 'A'}
          </button>
        )}
      </div>
    );
  }
);

TransliteratedInput.displayName = 'TransliteratedInput';

export interface TransliteratedTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onValueChange: (val: string) => void;
  showToggle?: boolean;
  wrapperClassName?: string;
}

export const TransliteratedTextarea = forwardRef<
  HTMLTextAreaElement,
  TransliteratedTextareaProps
>(
  (
    {
      value,
      onValueChange,
      showToggle = true,
      className = '',
      wrapperClassName = '',
      placeholder,
      onKeyDown,
      onBlur,
      ...props
    },
    ref
  ) => {
    const toggleId = useId();
    const { active, toggle, handleKeyDown, handleChange, handleBlur, lang } =
      useTransliteration({
        onTransliterate: onValueChange,
      });

    const isIndic = lang === 'mr' || lang === 'hi';

    return (
      <div className={`relative ${wrapperClassName}`}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => handleChange(e, onValueChange)}
          onKeyDown={(e) => {
            handleKeyDown(e, value, onValueChange);
            onKeyDown?.(e);
          }}
          onBlur={(e) => {
            handleBlur(value, onValueChange);
            onBlur?.(e);
          }}
          placeholder={placeholder}
          className={className}
          {...props}
        />
        {showToggle && isIndic && (
          <div className="absolute right-3 top-3 z-10">
            <button
              id={toggleId}
              type="button"
              tabIndex={-1}
              onClick={toggle}
              title={
                active
                  ? 'ध्वन्यात्मक लिप्यंतरण चालू (Phonetic typing ON) • बंद करण्यासाठी क्लिक करा (Ctrl+G)'
                  : 'इंग्रजी टायपिंग चालू (English typing ON) • देवनागरीसाठी क्लिक करा (Ctrl+G)'
              }
              aria-label={active ? 'ध्वन्यात्मक लिप्यंतरण चालू' : 'इंग्रजी टायपिंग चालू'}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition select-none cursor-pointer ${
                active
                  ? 'bg-gold/25 text-maroon ring-1 ring-gold/45 shadow-2xs hover:bg-gold/35'
                  : 'bg-charcoal/10 text-charcoal-muted hover:bg-charcoal/20'
              }`}
            >
              <span>{active ? 'अ' : 'A'}</span>
              <span className="text-[10px] font-medium hidden sm:inline">
                {active ? 'लिप्यंतरण' : 'English'}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

TransliteratedTextarea.displayName = 'TransliteratedTextarea';
