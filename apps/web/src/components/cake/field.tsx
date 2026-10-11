'use client';

/**
 * Cake Atelier Pro — small, consistent form primitives.
 *
 * Every control here is controlled, labelled and keyboard reachable, and none of
 * them is decorative: if a control is on screen it changes the design or the
 * export. Validation messages render next to the field that produced them.
 */

import type { ReactNode } from 'react';

const fieldLabel = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-maroon-800/70';

export function Field({
  label,
  hint,
  error,
  counter,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  counter?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className={fieldLabel} htmlFor={htmlFor}>
          {label}
        </label>
        {counter ? <span className="text-[11px] tabular-nums text-ink-400">{counter}</span> : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-[11px] font-medium text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] leading-snug text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  maxLength,
  placeholder,
  id,
  onBlur,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  id?: string;
  onBlur?: () => void;
  className?: string;
}) {
  const truncated = maxLength !== undefined && value.length > maxLength;
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      spellCheck={false}
      autoComplete="off"
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      maxLength={maxLength}
      aria-invalid={truncated || undefined}
      className={`w-full rounded-xl border border-ivory-300 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 ${className}`}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  maxLength,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  id?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      rows={rows}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y rounded-xl border border-ivory-300 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
    />
  );
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
  id,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; disabled?: boolean }[];
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="w-full rounded-xl border border-ivory-300 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  id,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : min}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(max, Math.max(min, next)));
        }}
        className="w-full rounded-xl border border-ivory-300 bg-white px-3 py-2 text-sm tabular-nums text-ink-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
      />
      {suffix ? <span className="text-xs text-ink-400">{suffix}</span> : null}
    </div>
  );
}

export function RangeInput({
  value,
  onChange,
  min,
  max,
  step,
  label,
  format,
  id,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  format?: (value: number) => string;
  id?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className={fieldLabel}>{label}</span>
        <span className="text-xs tabular-nums text-ink-500">{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ivory-300 accent-gold-600"
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-ivory-400 accent-gold-600 focus-ring"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-800">{label}</span>
        {hint ? <span className="mt-0.5 block text-[11px] leading-snug text-ink-400">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; title?: string }[];
  label: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-full border transition focus-ring ${
              size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
            } ${
              active
                ? 'border-maroon-700 bg-maroon-700 font-semibold text-ivory-100 shadow-sm'
                : 'border-ivory-300 bg-white text-ink-600 hover:border-gold-500 hover:text-maroon-800'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function PanelSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ivory-300/80 bg-white/85 p-4 shadow-sm backdrop-blur">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-maroon-900">{title}</h3>
          {description ? <p className="mt-0.5 text-[11px] leading-snug text-ink-400">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function StatusPill({ tone, children }: { tone: 'pass' | 'warn' | 'fail' | 'info'; children: ReactNode }) {
  const tones: Record<string, string> = {
    pass: 'bg-leaf-600/10 text-leaf-700 border-leaf-600/30',
    warn: 'bg-haldi/10 text-gold-800 border-haldi/40',
    fail: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-ivory-200 text-ink-600 border-ivory-400',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}
