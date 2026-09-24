export function KalashArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 168" aria-hidden="true" className={className}>
      <g fill="none" stroke="var(--color-gold-bright)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M18 152 H102" />
        <path d="M26 158 H94" strokeWidth="1" opacity="0.7" />
      </g>

      <path
        d="M24 96 C24 74 40 60 60 60 C80 60 96 74 96 96 C96 122 82 142 60 142 C38 142 24 122 24 96 Z"
        fill="currentColor"
      />
      <path
        d="M30 92 C34 108 44 120 60 126 C76 120 86 108 90 92"
        fill="none"
        stroke="var(--color-gold-bright)"
        strokeWidth="2"
        opacity="0.85"
      />
      <path
        d="M34 76 C44 86 76 86 86 76"
        fill="none"
        stroke="var(--color-gold-bright)"
        strokeWidth="1.6"
        opacity="0.7"
      />
      <circle cx="60" cy="104" r="7" fill="none" stroke="var(--color-gold-bright)" strokeWidth="1.6" />
      <circle cx="60" cy="104" r="2.6" fill="var(--color-gold-bright)" />

      <ellipse cx="60" cy="60" rx="24" ry="7" fill="var(--color-gold-bright)" />
      <ellipse cx="60" cy="58" rx="18" ry="5" fill="var(--color-gold-deep)" opacity="0.55" />

      <g fill="var(--color-paithani)">
        <path d="M56 54 C42 48 30 36 26 20 C44 22 56 36 58 52 Z" />
        <path d="M64 54 C78 48 90 36 94 20 C76 22 64 36 62 52 Z" />
        <path d="M60 50 C54 36 54 22 60 8 C66 22 66 36 60 50 Z" />
      </g>
      <g fill="none" stroke="var(--color-gold-bright)" strokeWidth="1" opacity="0.75">
        <path d="M56 50 C46 42 36 32 30 22" />
        <path d="M64 50 C74 42 84 32 90 22" />
        <path d="M60 46 L60 16" />
      </g>

      <ellipse cx="60" cy="34" rx="13" ry="16" fill="var(--color-gold-deep)" />
      <path d="M52 26 C56 20 64 20 68 26" fill="none" stroke="var(--color-gold-bright)" strokeWidth="1.6" />
      <path d="M60 18 L60 10" stroke="var(--color-gold-bright)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="60" cy="8" r="2.5" fill="var(--color-gold-bright)" />
    </svg>
  );
}
