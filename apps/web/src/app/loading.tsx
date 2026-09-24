export default function Loading() {
  return (
    <div className="shell py-16" role="status" aria-live="polite" aria-label="मजकूर लोड होत आहे">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="skeleton h-8 w-2/3 rounded-full" />
        <div className="skeleton h-4 w-full rounded-xl" />
        <div className="skeleton h-4 w-5/6 rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-elevated h-28 animate-pulse bg-ivory-deep/40" aria-hidden />
          <div className="surface-elevated h-28 animate-pulse bg-ivory-deep/40" aria-hidden />
          <div className="surface-elevated h-28 animate-pulse bg-ivory-deep/40" aria-hidden />
        </div>
        <p className="text-center font-ui text-sm font-medium text-charcoal-muted">मजकूर लोड होत आहे…</p>
      </div>
    </div>
  );
}
