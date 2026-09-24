export function PaisleyRule({ id = 'paisley-rule', className = '' }: { id?: string; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} width="100%" height="20" preserveAspectRatio="none" viewBox="0 0 480 20">
      <defs>
        <pattern id={id} width="60" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M6 16 C6 9 11 4 17 4 C22 4 25.5 7.5 25.5 11.5 C25.5 15 22.5 17 20.5 15 C18.5 13 20.5 10 22.5 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path d="M34 4 C40 7 40 13 34 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="47" cy="10" r="1.6" fill="currentColor" />
          <circle cx="55" cy="5" r="1" fill="currentColor" opacity="0.7" />
          <circle cx="55" cy="15" r="1" fill="currentColor" opacity="0.7" />
        </pattern>
      </defs>
      <rect width="480" height="20" fill={`url(#${id})`} />
    </svg>
  );
}
