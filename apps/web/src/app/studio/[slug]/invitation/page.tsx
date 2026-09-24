import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TEMPLATE_PRESETS } from '@mazi/design-schema';
import { formatMarathiDate, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';
import { renderSvg } from '@mazi/renderer';

import { InvitationCanvas } from '@/components/studio/invitation-canvas';
import { PrintOrderPanel } from '@/components/studio/print-order-panel';
import { getStore } from '@/lib/store';
import { devRupees } from '@/lib/format';

import { designForEvent, printQuote, STUDIO_SCHEMES } from './studio';

export const dynamic = 'force-dynamic';

const PANELS = [
  { paper: 'matte-300gsm', label: 'मॅट ३०० जीएसएम' },
  { paper: 'silk-350gsm', label: 'सिल्क ३५० जीएसएम' },
  { paper: 'metallic-250gsm', label: 'मेटॅलिक २५० जीएसएम' },
];

const FINISHING = [
  { code: 'gold-foil', label: 'सोनेरी फॉइल' },
  { code: 'emboss', label: 'उठाव' },
  { code: 'spot-uv', label: 'स्पॉट यूव्ही' },
  { code: 'die-cut', label: 'डाय-कट' },
  { code: 'waxseal', label: 'मेणमुद्रा' },
  { code: 'envelope', label: 'लिफाफा' },
];

export default async function InvitationStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const store = getStore();
  const event = store.events.bySlug(slug);
  if (!event) notFound();

  const first = <T,>(value: string | string[] | undefined, fallback: T): T =>
    (typeof value === 'string' ? (value as unknown as T) : fallback);

  const templateId = first<string>(query.template, TEMPLATE_PRESETS[0]!.id);
  const schemeId = first<string>(query.scheme, 'paithani');
  const includeEnglish = query.english === '0' ? false : query.english === '1';
  const includePanchang = query.panchang !== '0';
  const includeQr = query.qr !== '0';
  const note = first<string>(query.note, '');

  const { design, composed, preset, scheme } = designForEvent({
    slug,
    templateId,
    schemeId,
    includeEnglish,
    includePanchang,
    includeQr,
    ...(note ? { note } : {}),
  });

  const svg = renderSvg(design, { print: false });
  const printSvg = renderSvg(design, { print: true });
  const printIssues = composed.quality.checks;

  const quantity = Number(first<string>(query.qty, '250')) || 250;
  const paper = first<string>(query.paper, 'matte-300gsm');
  const express = query.express === '1';
  const finishing = FINISHING.filter((item) => {
    const value = query.finish;
    const list = Array.isArray(value) ? value : value ? [value] : [];
    return list.includes(item.code);
  }).map((item) => item.code);

  const quote = printQuote({ designId: design.id, quantity, paper, finishing, express });
  const designs = store.designs.list({ eventId: event.id, limit: 10 });

  return (
    <div className="shell py-8">
      <nav aria-label="ब्रेडक्रम्ब" className="font-ui text-xs text-charcoal-soft">
        <Link href={`/studio/${slug}`} className="underline decoration-gold underline-offset-4">
          {event.title}
        </Link>{' '}
        / पत्रिका स्टुडिओ
      </nav>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon">पत्रिका स्टुडिओ</h1>
          <p className="mt-1 text-sm text-charcoal-soft">
            {preset.name} • {scheme.label} • {design.preset} • {toDevanagariDigits(design.page.widthMm)}×
            {toDevanagariDigits(design.page.heightMm)} मिमी + bleed {toDevanagariDigits(design.page.bleedMm)} मिमी
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`/api/designs/${design.id}/svg?print=1`}
            className="rounded-full border border-maroon/30 px-4 py-2 text-sm font-semibold text-maroon"
          >
            प्रिंट SVG
          </a>
          <a
            href={`/api/designs/${design.id}/print`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-gold/50 px-4 py-2 text-sm font-semibold text-charcoal"
          >
            प्रूफ उघडा
          </a>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <InvitationCanvas
            slug={slug}
            svg={svg}
            printSvg={printSvg}
            current={{
              templateId, schemeId, includeEnglish, includePanchang, includeQr, note,
              quantity, paper, express, finishing,
            }}
            templates={TEMPLATE_PRESETS.map((template) => ({ id: template.id, name: template.name, tags: template.tags }))}
            schemes={STUDIO_SCHEMES.map((entry) => ({ id: entry.id, label: entry.label, surface: entry.palette.surface ?? '#FBF7F0', accent: entry.palette.accent ?? '#C6A15B', primary: entry.palette.primary ?? '#6B1D2A' }))}
            papers={PANELS}
            finishing={FINISHING}
          />

          <section className="surface p-5">
            <h2 className="font-display text-xl font-bold text-charcoal">रचना (composed) मजकूर</h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              हा मजकूर मराठी भाषा-इंजिन तयार करते — नातेसंबंध, आदरार्थी व विधी-प्रकारानुसार. तोच मजकूर पत्रिकेवर, डिजिटल पानावर व
              व्हॉट्सअॅप संदेशात जातो.
            </p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">मुख्य आमंत्रण</h3>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-gold/25 bg-ivory p-3 font-[inherit] text-sm leading-relaxed text-charcoal">
                  {composed.plainText}
                </pre>
              </div>
              <div>
                <h3 className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">व्हॉट्सअॅप संदेश</h3>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-gold/25 bg-ivory p-3 font-[inherit] text-sm leading-relaxed text-charcoal">
                  {composed.whatsappText}
                </pre>
                <h3 className="mt-4 font-ui text-xs uppercase tracking-wider text-charcoal-soft">पंचांग ओळी</h3>
                <ul className="mt-2 space-y-1 text-sm text-charcoal-soft">
                  {composed.panchangLines.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface p-5">
            <h2 className="font-display text-lg font-bold text-charcoal">प्री-फ्लाइट तपासणी</h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              छपाईच्या आधी कागद, bleed व रंग तपासले जातात — प्रूफमध्ये दिसणार नाही असे काहीही छापले जात नाही.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {printIssues.map((check) => (
                <li key={check.id} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className={
                      check.status === 'pass'
                        ? 'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-paithani text-[11px] text-ivory'
                        : check.status === 'warn'
                          ? 'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold text-[11px] text-ivory'
                          : 'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-maroon text-[11px] text-ivory'
                    }
                  >
                    {check.status === 'pass' ? '✓' : '!'}
                  </span>
                  <span>
                    <span className="font-semibold text-charcoal">{check.label}</span>
                    {check.detail ? <span className="block text-xs text-charcoal-soft">{check.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-gold/30 bg-ivory-deep/50 px-3 py-2">
              <span className="font-ui text-xs uppercase tracking-wider text-charcoal-soft">गुणवत्ता गुण</span>
              <span className="font-display text-xl font-bold text-maroon">{toDevanagariDigits(composed.quality.score)}/१००</span>
            </div>
          </section>

          <PrintOrderPanel
            slug={slug}
            designId={design.id}
            quote={quote}
            history={designs.map((entry) => ({
              id: entry.id,
              name: entry.name,
              version: entry.version,
              status: entry.status,
              updatedAt: entry.updatedAt,
              scheme: entry.scheme,
            }))}
            eventDateLabel={event.eventDate ? formatMarathiDate(event.eventDate) : 'तारीख ठरलेली नाही'}
            printerLabel={vendorCategoryLabel('printer')}
            expressDefault={express}
          />
        </aside>
      </div>

      <p className="mt-6 text-xs text-charcoal-soft">
        एकच Design JSON (v3) → SVG प्रीव्ह्यू, प्रिंट प्रूफ (bleed + crop marks) आणि डिजिटल पान. मजकूर कधीही प्रतिमेत गुंडाळला जात नाही,
        म्हणून शोध व स्क्रीन-रीडर दोन्ही चालतात. अंदाजे कागद खर्च {devRupees(quote.unitPricePaise)}/कार्ड.
      </p>
    </div>
  );
}
