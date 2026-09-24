const OUTER = Array.from({ length: 8 }, (_, i) => i * 45);
const DOTS = Array.from({ length: 16 }, (_, i) => i * 22.5);
const RAYS = Array.from({ length: 12 }, (_, i) => i * 30);

export function MandalaRosette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-70 -70 140 140" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle r="64" strokeWidth="1" strokeDasharray="1.5 7" />
        <circle r="56" strokeWidth="1.2" />
        <circle r="20" strokeWidth="1.2" />
        <circle r="13" strokeWidth="1" strokeDasharray="3 4" />
        {OUTER.map((angle) => (
          <path
            key={angle}
            d="M0 -22 C 8 -32 16 -42 0 -56 C -16 -42 -8 -32 0 -22 Z"
            transform={`rotate(${angle})`}
          />
        ))}
        {RAYS.map((angle) => (
          <path key={angle} d="M0 -13 L0 -56" transform={`rotate(${angle})`} strokeWidth="0.7" opacity="0.55" />
        ))}
        {DOTS.map((angle) => (
          <circle key={angle} r="2.2" cy="-64" transform={`rotate(${angle})`} fill="currentColor" stroke="none" />
        ))}
      </g>
      <circle r="5.5" fill="currentColor" />
      <circle r="2.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

const PETAL = 'M0 0 C 10 -8 18 -20 18 -34 C 18 -46 10 -54 0 -54 C -10 -54 -18 -46 -18 -34 C -18 -20 -10 -8 0 0 Z';

export function MandalaCorner({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 130" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.3" transform="translate(4 4)">
        <path d="M4 118 A 114 114 0 0 0 118 4" strokeWidth="1" />
        <path d="M4 98 A 94 94 0 0 0 98 4" />
        <path d="M4 78 A 74 74 0 0 0 78 4" strokeWidth="1" strokeDasharray="4 5" />
        <path d="M4 54 A 50 50 0 0 0 54 4" />
        {[-8, 2, 12].map((deg, index) => (
          <g key={deg} transform={`translate(${28 + index * 4} ${28 + index * 4}) rotate(-45) scale(${0.55 - index * 0.08})`}>
            <path d={PETAL} />
          </g>
        ))}
        {[
          [4, 88],
          [4, 64],
          [64, 4],
          [88, 4],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" fill="currentColor" stroke="none" />
        ))}
      </g>
      <circle cx="10" cy="10" r="3.5" fill="currentColor" />
    </svg>
  );
}
