'use client';

import { useOptimistic, useTransition } from 'react';

import { MARATHI_MONTHS_SHORT, formatMarathiDate, toDevanagariDigits } from '@mazi/marathi';

import type { Task } from '@mazi/store';

import { addTaskAction, toggleTaskAction } from '@/app/studio/[slug]/actions';

const PRIORITY_LABEL: Record<number, string> = { 1: 'तातडीचे', 2: 'महत्त्वाचे', 3: 'सामान्य' };

export function TaskPanel({ slug, tasks, overdue }: { slug: string; tasks: Task[]; overdue: number }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, toggleOptimistic] = useOptimistic(
    tasks,
    (current: Task[], taskId: string) =>
      current.map((task) => (task.id === taskId ? { ...task, status: task.status === 'done' ? 'open' : 'done' } : task)),
  );

  const open = optimistic.filter((task) => task.status !== 'done');
  const done = optimistic.filter((task) => task.status === 'done');

  return (
    <section className="surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">कार्यसूची</h2>
        <p className="font-ui text-xs text-charcoal-soft">
          {toDevanagariDigits(done.length)}/{toDevanagariDigits(optimistic.length)} पूर्ण
          {overdue ? ` • ${toDevanagariDigits(overdue)} मुदत संपलेली` : ''}
        </p>
      </div>

      <form
        action={(formData) => {
          startTransition(async () => {
            await addTaskAction(formData);
          });
        }}
        className="mt-4 grid gap-2 sm:grid-cols-[1.6fr_1fr_0.8fr_auto]"
      >
        <input type="hidden" name="slug" value={slug} />
        <input
          name="title"
          required
          maxLength={160}
          placeholder="नवीन कार्य — उदा. हळदीचे हॉल आरक्षित करा"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <input
          name="category"
          placeholder="श्रेणी — उदा. सजावट"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <input
          name="dueDate"
          type="date"
          className="rounded-xl border border-gold/40 bg-ivory px-3 py-2 text-sm text-charcoal outline-none focus:border-maroon"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-maroon px-4 py-2 text-sm font-semibold text-ivory disabled:opacity-60"
        >
          जोडा
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {open.map((task) => (
          <TaskRow key={task.id} slug={slug} task={task} onToggle={toggleOptimistic} />
        ))}
        {done.length ? (
          <li className="pt-2">
            <p className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">पूर्ण झालेली ({toDevanagariDigits(done.length)})</p>
          </li>
        ) : null}
        {done.slice(0, 6).map((task) => (
          <TaskRow key={task.id} slug={slug} task={task} onToggle={toggleOptimistic} />
        ))}
      </ul>
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

  return (
    <li className="flex items-start gap-3 rounded-xl border border-gold/20 bg-ivory px-3 py-2.5">
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
          className={
            task.status === 'done'
              ? 'mt-0.5 grid size-6 place-items-center rounded-md border border-paithani bg-paithani text-xs text-ivory'
              : 'mt-0.5 grid size-6 place-items-center rounded-md border border-gold/60 bg-ivory text-xs text-transparent hover:text-gold'
          }
        >
          ✓
        </button>
      </form>
      <div className="min-w-0 flex-1">
        <p className={task.status === 'done' ? 'text-sm text-charcoal-soft line-through' : 'text-sm font-semibold text-charcoal'}>
          {task.title}
        </p>
        <p className="mt-0.5 font-ui text-xs text-charcoal-soft">
          {task.category} • प्राधान्य: {PRIORITY_LABEL[task.priority] ?? 'सामान्य'}
          {task.dueDate
            ? ` • ${formatMarathiDate(task.dueDate)} (${MARATHI_MONTHS_SHORT[new Date(`${task.dueDate}T00:00:00Z`).getUTCMonth()]})`
            : ''}
        </p>
      </div>
      {overdueTask ? (
        <span className="rounded-full border border-maroon/40 bg-maroon/8 px-2 py-0.5 text-[11px] text-maroon">मुदत संपली</span>
      ) : null}
    </li>
  );
}
