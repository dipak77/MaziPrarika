import { NextResponse } from 'next/server';

import { rsvpAction } from '../actions';

/**
 * POST /api of the public page, kept as a route handler so a guest link can be
 * submitted from a plain <form> even when JavaScript is unavailable — many
 * relatives open these links on a low-end phone in a weak-network village.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  const form = contentType.includes('application/json')
    ? toFormData((await request.json()) as Record<string, unknown>)
    : await request.formData();

  const result = await rsvpAction(form);
  if (contentType.includes('application/json')) {
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  // Redirect back to the page the guest came from; if the form arrived without a
  // slug (a hand-rolled POST), fall back to the referrer's path rather than
  // building a broken `/e/null` URL.
  const url = new URL(request.url);
  const slug = String(form.get('slug') ?? '').trim();
  const referrer = request.headers.get('referer');
  const fallbackPath = referrer ? new URL(referrer).pathname : '/events';
  const target = slug ? `/e/${slug}` : fallbackPath;
  return NextResponse.redirect(new URL(`${target}?rsvp=${result.ok ? 'ok' : 'error'}#rsvp`, url.origin), {
    status: 303,
  });
}

function toFormData(payload: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) form.set(key, String(value ?? ''));
  return form;
}
