import { NextResponse } from 'next/server';

import {
  ExportBlockedError,
  ExportRequestSchema,
  FORMAT_META,
  generateExport,
  reportToText,
  sanitizeFileName,
} from '@mazi/cake-atelier/server';

/**
 * POST /api/cake/export
 *
 * The one place a customer's design becomes a file. Everything the print shop
 * receives passes through here, which is why the guards are explicit:
 *
 *   • the body is parsed by the same Zod schema the studio and the tests use,
 *     and rejected (400) with the reasons attached if it does not fit;
 *   • the body is size-limited before it is parsed (a design is a few kilobytes;
 *     512 kB is already generous, and it keeps a hostile client from allocating
 *     an export's worth of memory on every request);
 *   • preflight blocks the request with 422 unless the caller acknowledged the
 *     warnings, in which case the acknowledgement is recorded in the report;
 *   • the whole render runs under a timeout, because a native rasteriser that
 *     never returns would hold the worker forever;
 *   • the download filename is sanitised server-side, so a name like
 *     `../../etc/passwd` can only ever become `etc_passwd`.
 *
 * `dryRun: true` returns the measurements, layers, checklist and report text and
 * renders nothing — that is what the print studio's "Check" button calls.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BODY_BYTES = 512 * 1024;
const RENDER_TIMEOUT_MS = 45_000;

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'That design is too large to export.', detail: `The request was ${Math.round(declaredLength / 1024)} kB; the limit is ${MAX_BODY_BYTES / 1024} kB.` },
      { status: 413 },
    );
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'That design is too large to export.', detail: `The request was ${Math.round(text.length / 1024)} kB; the limit is ${MAX_BODY_BYTES / 1024} kB.` }, { status: 413 });
    }
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'The export request was not valid JSON.' }, { status: 400 });
  }

  const parsed = ExportRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'The export request did not pass validation.',
        issues: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`),
      },
      { status: 400 },
    );
  }

  const { project, dryRun, acknowledgement, ...settings } = parsed.data;

  try {
    // A native rasteriser that never returns would hold this worker forever, so
    // the render races a hard timeout. The timer is cleared either way.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error('The export took longer than a minute and was stopped. Try a smaller size or a lower PPI.')),
        RENDER_TIMEOUT_MS,
      );
    });
    const result = await Promise.race([
      generateExport({
        project,
        settings: { ...project.export, ...settings },
        ...(dryRun ? { reportOnly: true } : {}),
        ...(acknowledgement ? { acknowledged: { acceptedWarnings: acknowledgement.acceptedWarnings, at: acknowledgement.at } } : {}),
        generatedAt: new Date().toISOString(),
      }),
      timeout,
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });

    const elapsedMs = Date.now() - started;

    if (dryRun) {
      return NextResponse.json(
        {
          ok: true,
          dryRun: true,
          fileName: result.fileName,
          format: result.format,
          mime: result.mime,
          elapsedMs,
          files: result.files,
          preflight: result.preflight,
          report: result.report,
          reportText: reportToText(result.report),
        },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    if (!result.bytes.length) {
      return NextResponse.json({ error: 'The export produced no data.' }, { status: 500 });
    }

    // The engine already builds a safe name; sanitising again here is cheap and
    // means a future change to the engine cannot turn into a header-injection or
    // path-traversal bug in the web layer.
    const safeName = sanitizeFileName(result.fileName) || `cake-topper.${FORMAT_META[result.format].extension}`;

    return new NextResponse(Buffer.from(result.bytes), {
      status: 200,
      headers: {
        'Content-Type': result.mime,
        'Content-Length': String(result.bytes.length),
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'no-store',
        'X-Cake-Format': result.format,
        'X-Cake-File-Name': safeName,
        'X-Cake-Preflight-Warnings': String(result.preflight.warnings.length),
        'X-Cake-Render-Ms': String(elapsedMs),
        'X-Cake-Files': result.files.join(','),
      },
    });
  } catch (error) {
    if (error instanceof ExportBlockedError) {
      return NextResponse.json(
        {
          error: 'This design is not ready to print yet.',
          blocked: true,
          preflight: error.preflight,
          issues: error.preflight.errors.map((issue) => ({ id: issue.id, title: issue.title, detail: issue.detail, remedy: issue.remedy })),
        },
        { status: 422 },
      );
    }
    return NextResponse.json(
      {
        error: 'The export failed.',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Use POST for exports.',
      usage: {
        method: 'POST',
        contentType: 'application/json',
        body: '{ project: DesignProject, format: "png"|"svg"|"pdf"|"layers", ppi?, transparent?, bleedMm?, includeCutline?, includeGuides?, includeRegistration?, outlineText?, cutToleranceMm?, acknowledgement?, dryRun? }',
        dryRun: 'Returns the preflight checklist, production report and file list without rendering.',
      },
    },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
