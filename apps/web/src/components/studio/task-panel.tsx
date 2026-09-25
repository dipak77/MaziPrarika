'use client';

import { useOptimistic, useState, useTransition } from 'react';

import { MARATHI_MONTHS_SHORT, formatMarathiDate, toDevanagariDigits } from '@mazi/marathi';

import type { Task } from '@mazi/store';

import { addTaskAction, toggleTaskAction } from '@/app/studio/[slug]/actions';

const PRIORITY_LABEL: Record<number, string> = { 1: 'तातडीचे', 2: 'महत्त्वाचे', 3: 'सामान्य' };

export function TaskPanel({ slug, tasks, overdue }: { slug: string; tasks: Task[]; overdue: number }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [optimistic, toggleOptimistic] = useOptimistic(
    tasks,
    (current: Task[], taskId: string) =>
      current.map((task) => (task.id === taskId ? { ...task, status: task.status === 'done' ? 'open' : 'done' } : task)),
  );

  const open = optimistic.filter((task) => task.status !== 'done');
  const done = optimistic.filter((task) => task.status === 'done');
  const total = optimistic.length;
  const donePct = total > 0 ? Math.round((done.length / total) * 100) : 0;
  const ringC = 2 * Math.PI * 15;
  const ringDash = (donePct / 100) * ringC;

  return (
    <section aria-labelledby="tasks-heading" className="surface-elevated animate-fade-up overflow-hidden p-0">
      <div aria-hidden className="paithani-edge h-1.5" />
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative grid size-14 shrink-0 place-items-center" role="img" aria-label={`कार्ये ${toDevanagariDigits(done.length)} पैकी ${toDevanagariDigits(total)} पूर्ण`}>
              <svg viewBox="0 0 40 40" className="size-14 -rotate-90">
                <circle cx="20" cy="20" r="15" fill="none" stroke="var(--color-ivory-deep)" strokeWidth="5" />
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  fill="none"
                  stroke="var(--color-paithani)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${ringDash} ${ringC}`}
                  style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.22,1,0.36,1)' }}
                />
              </svg>
              <span className="absolute font-display text-xs font-bold tabular-nums text-charcoal">{toDevanagariDigits(donePct)}%</span>
            </div>
            <div>
              <h2 id="tasks-heading" className="tracking-tight text-charcoal">कार्यसूची</h2>
              <p className="mt-0.5 font-ui text-xs font-semibold text-charcoal-soft">
                {toDevanagariDigits(done.length)}/{toDevanagariDigits(total)} पूर्ण
                {overdue ? ` • ${toDevanagariDigits(overdue)} मुदत संपलेली` : ''}
              </p>
            </div>
          </div>
          <span className="inline-flex min-h-11 items-center rounded-full bg-ivory-deep px-4 py-2 font-ui text-xs font-bold text-charcoal-soft ring-1 ring-gold/20">
            खुली {toDevanagariDigits(open.length)}
          </span>
        </div>

        {overdue > 0 ? (
          <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-2xl border border-maroon/25 bg-maroon-light px-4 py-3 text-xs leading-relaxed text-maroon">
            <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-maroon text-xs font-bold text-white">!</span>
            <p><span className="font-bold">{toDevanagariDigits(overdue)} कार्यांची मुदत संपली.</span> प्राधान्याने पूर्ण करा — यादीत लाल खूण दिसेल.</p>
          </div>
        ) : null}

        <form
          action={(formData) => {
            setResult(null);
            startTransition(async () => {
              try {
                await addTaskAction(formData);
                setResult({ ok: true, message: 'कार्य जोडले — यादीत दिसेल.' });
              } catch (error) {
                setResult({
                  ok: false,
                  message: error instanceof Error ? error.message : 'कार्य जोडता आले नाही — पुन्हा प्रयत्न करा.',
                });
              }
            });
          }}
          className="mt-4 grid gap-2.5 sm:grid-cols-[1.6fr_1fr_0.8fr_auto]"
        >
          <input type="hidden" name="slug" value={slug} />
          <label className="sr-only" htmlFor={`task-title-${slug}`}>नवीन कार्य</label>
          <input
            id={`task-title-${slug}`}
            name="title"
            required
            maxLength={160}
            placeholder="नवीन कार्य — उदा. हळदीचे हॉल आरक्षित करा"
            className="min-h-11 rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10"
          />
          <input
            name="category"
            placeholder="श्रेणी — उदा. सजावट"
            aria-label="कार्य श्रेणी"
            className="min-h-11 rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10"
          />
          <input
            name="dueDate"
            type="date"
            aria-label="नियोजित तारीख"
            className="min-h-11 rounded-xl border border-gold/40 bg-ivory px-3.5 py-2.5 text-sm text-charcoal shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10"
          />
          <button
            type="submit"
            disabled={pending}
            className="btn-base btn-maroon min-h-11 px-5 text-sm shadow-sm disabled:opacity-60"
          >
            {pending ? 'जोडत आहे…' : 'जोडा'}
          </button>
        </form>

        {pending ? (
          <div aria-hidden className="mt-4 space-y-2">
            <div className="skeleton h-16 rounded-2xl" />
            <div className="skeleton h-16 rounded-2xl" />
          </div>
        ) : null}

        {result ? (
          <p
            className={`mt-3 rounded-xl border px-3.5 py-2.5 text-xs font-medium leading-relaxed ${
              result.ok
                ? 'border-paithani/30 bg-paithani-soft text-paithani'
                : 'border-maroon/30 bg-maroon-light text-maroon'
            }`}
            role={result.ok ? 'status' : 'alert'}
          >
            {result.message}
          </p>
        ) : null}

        {total === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gold/35 bg-ivory-deep/50 px-4 py-9 text-center">
            <p className="font-display font-bold text-charcoal">अजून कार्य नाही</p>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-charcoal-soft">वरच्या फॉर्ममध्ये पहिले कार्य लिहा — उदा. मंगल कार्यालय आरक्षित करा, निमंत्रण यादी निश्चित करा.</p>
          </div>
        ) : (
          <ul className="stagger mt-4 space-y-2.5">
            {open.map((task) => (
              <TaskRow key={task.id} slug={slug} task={task} onToggle={toggleOptimistic} />
            ))}
            {done.length ? (
              <li className="pt-2">
                <p className="font-ui text-xs font-bold uppercase tracking-widest text-charcoal-soft">पूर्ण झालेली ({toDevanagariDigits(done.length)})</p>
              </li>
            ) : null}
            {done.slice(0, 6).map((task) => (
              <TaskRow key={task.id} slug={slug} task={task} onToggle={toggleOptimistic} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TaskRow({
  slug,
  task,
  onToggle,
}: {
  slug: string;
  task: Task;
  onToggle: (taskId: string) => void;
}) {
  const [, startTransition] = useTransition();
  const overdueTask = task.status === 'open' && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10);
  const monthShort = task.dueDate ? (MARATHI_MONTHS_SHORT[new Date(`${task.dueDate}T00:00:00Z`).getUTCMonth()] ?? '') : '';

  return (
    <li className={`flex items-start gap-3 rounded-2xl border bg-white px-3 py-3 shadow-2xs transition hover:shadow-soft ${overdueTask ? 'border-maroon/30' : 'border-gold/20 hover:border-gold/40'}`}>
      <form
        action={(formData) => {
          startTransition(async () => {
            onToggle(task.id);
            await toggleTaskAction(formData);
          });
        }}
      >
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="taskId" value={task.id} />
        <button
          type="submit"
          aria-label={task.status === 'done' ? `${task.title} पुन्हा उघडा` : `${task.title} पूर्ण करा`}
          aria-pressed={task.status === 'done'}
          className={
            task.status === 'done'
              ? 'grid size-11 shrink-0 place-items-center rounded-xl border border-paithani bg-paithani text-sm font-bold text-ivory'
              : 'grid size-11 shrink-0 place-items-center rounded-xl border border-gold/60 bg-ivory text-sm text-transparent transition hover:border-paithani hover:text-paithani'
          }
        >
          ✓
        </button>
      </form>
      <div className="min-w-0 flex-1">
        <p className={task.status === 'done' ? 'text-sm text-charcoal-soft line-through' : 'text-sm font-semibold leading-snug text-charcoal'}>
          {task.title}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 font-ui text-xs text-charcoal-soft">
          <span className="rounded-full bg-ivory-deep px-2 py-0.5 font-semibold">{task.category}</span>
          <span>प्राधान्य: {PRIORITY_LABEL[task.priority] ?? 'सामान्य'}</span>
          {task.dueDate ? <span>• {formatMarathiDate(task.dueDate)}{monthShort ? ` (${monthShort})` : ''}</span> : null}
        </p>
      </div>
      {overdueTask ? (
        <span className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-maroon/30 bg-maroon-light px-2.5 py-1 text-xs font-bold text-maroon">मुदत संपली</span>
      ) : null}
    </li>
  );
}
