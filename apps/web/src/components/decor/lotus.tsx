const PETALS = Array.from({ length: 8 }, (_, i) => i * 45);

export function LotusMotif({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-60 -60 120 120" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        {PETALS.map((angle) => (
          <path
            key={angle}
            d="M0 -8 C 12 -18 20 -32 0 -52 C -20 -32 -12 -18 0 -8 Z"
            transform={`rotate(${angle})`}
            opacity="0.9"
          />
        ))}
        <circle r="10" />
        <circle r="54" strokeWidth="0.8" strokeDasharray="2 6" />
      </g>
      <circle r="4.5" fill="currentColor" />
    </svg>
  );
}
