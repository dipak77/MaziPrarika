import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TEMPLATE_PRESETS } from '@mazi/design-schema';
import { formatMarathiDate, toDevanagariDigits, vendorCategoryLabel } from '@mazi/marathi';
import { renderSvg } from '@mazi/renderer';

import { PageBanner } from '@/components/page-banner';
import { ComposedCopyButtons, InvitationCanvas, QualityRing } from '@/components/studio/invitation-canvas';
import { PrintOrderPanel } from '@/components/studio/print-order-panel';
import { getStore } from '@/lib/store';
import { devRupees } from '@/lib/format';

import { designForEvent, printQuote, STUDIO_SCHEMES } from './studio';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getStore().events.bySlug(slug);
  if (!event) return { title: 'पत्रिका स्टुडिओ' };
  return {
    title: `पत्रिका स्टुडिओ — ${event.title}`,
    description: 'Design JSON → SVG प्रीव्ह्यू, प्रिंट प्रूफ आणि छपाई ऑर्डर — मराठी पत्रिका स्टुडिओ.',
  };
}

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
  const activeDesignId = first<string>(query.design, '');

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

  const toParams = () => {
    const p = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) p.append(key, item);
      } else {
        p.set(key, value);
      }
    }
    return p;
  };
  const mrParams = toParams();
  mrParams.set('english', '0');
  const enParams = toParams();
  enParams.set('english', '1');

  return (
    <div className="shell py-8 pb-24 lg:pb-8">
      <nav aria-label="ब्रेडक्रम्ब" className="font-ui text-xs text-charcoal-soft">
        <Link href={`/studio/${slug}`} className="underline decoration-gold underline-offset-4">
          {event.title}
        </Link>{' '}
        / पत्रिका स्टुडिओ
      </nav>

      <div role="group" aria-label="मराठी ⇄ English" className="mt-4 inline-flex overflow-hidden rounded-full border border-gold/40 bg-white shadow-2xs">
        <a
          href={`/studio/${slug}/invitation?${mrParams.toString()}`}
          aria-current={includeEnglish ? undefined : 'true'}
          aria-label="मराठीत पहा"
          className={
            includeEnglish
              ? 'inline-flex min-h-11 min-w-11 items-center justify-center px-4 py-2 text-sm font-bold text-charcoal-soft hover:text-maroon'
              : 'inline-flex min-h-11 min-w-11 items-center justify-center bg-maroon px-4 py-2 text-sm font-bold text-ivory'
          }
        >
          मराठी
        </a>
        <a
          href={`/studio/${slug}/invitation?${enParams.toString()}`}
          aria-current={includeEnglish ? 'true' : undefined}
          aria-label="View in English"
          className={
            includeEnglish
              ? 'inline-flex min-h-11 min-w-11 items-center justify-center bg-maroon px-4 py-2 text-sm font-bold text-ivory'
              : 'inline-flex min-h-11 min-w-11 items-center justify-center px-4 py-2 text-sm font-bold text-charcoal-soft hover:text-maroon'
          }
        >
          English
        </a>
      </div>

      <PageBanner
        className="mt-3"
        kicker="Invitation studio"
        title="पत्रिका स्टुडिओ"
        description={`${preset.name} • ${scheme.label} • ${design.preset} • ${toDevanagariDigits(design.page.widthMm)}×${toDevanagariDigits(design.page.heightMm)} मिमी + bleed ${toDevanagariDigits(design.page.bleedMm)} मिमी${activeDesignId ? ` • आवृत्ती ${designs.find((entry) => entry.id === activeDesignId)?.name ?? activeDesignId}` : ''}`}
        actions={
        <div className="flex flex-wrap gap-3">
          <a
            href={`/api/designs/${design.id}/svg?print=1&slug=${encodeURIComponent(slug)}&v=${design.version}`}
            className="btn-base min-h-11 border border-maroon/30 px-4 text-sm font-semibold text-maroon hover:bg-maroon/5"
          >
            प्रिंट SVG
          </a>
          <a
            href={`/api/designs/${design.id}/print?slug=${encodeURIComponent(slug)}&v=${design.version}`}
            target="_blank"
            rel="noreferrer"
            className="btn-base btn-outline min-h-11 px-4 text-sm"
          >
            प्रूफ उघडा
          </a>
        </div>
        }
      />

      <section aria-label="छपाई खर्च सारांश" className="surface mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <div>
          <p className="font-ui text-[11px] font-bold uppercase tracking-widest text-charcoal-muted">प्रमाण</p>
          <p className="font-display text-lg font-bold text-charcoal">{toDevanagariDigits(quote.quantity)} कार्डे</p>
        </div>
        <div>
          <p className="font-ui text-[11px] font-bold uppercase tracking-widest text-charcoal-muted">प्रति कार्ड</p>
          <p className="font-display text-lg font-bold text-charcoal">{devRupees(quote.unitPricePaise)}</p>
        </div>
        <div>
          <p className="font-ui text-[11px] font-bold uppercase tracking-widest text-charcoal-muted">वाहतूक</p>
          <p className="font-display text-lg font-bold text-charcoal">{quote.shippingPaise === 0 ? 'मोफत' : devRupees(quote.shippingPaise)}</p>
        </div>
        <div>
          <p className="font-ui text-[11px] font-bold uppercase tracking-widest text-charcoal-muted">एकूण देय</p>
          <p className="font-display text-xl font-bold text-maroon">{devRupees(quote.totalPaise)}</p>
        </div>
        <a href="#print-order" className="btn-base btn-maroon ml-auto min-h-11 px-5 text-sm">
          ऑर्डरकडे जा
        </a>
        <span aria-live="polite" role="status" className="sr-only">
          {toDevanagariDigits(quote.quantity)} कार्डे, एकूण {devRupees(quote.totalPaise)}
        </span>
      </section>

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
            designs={designs.map((entry) => ({
              id: entry.id,
              name: entry.name,
              version: entry.version,
              status: entry.status,
              updatedAt: entry.updatedAt,
              scheme: entry.scheme,
            }))}
            activeDesignId={activeDesignId}
            designId={design.id}
          />

          <section aria-labelledby="composed-heading" className="surface animate-fade-up p-5">
            <h2 id="composed-heading" className="font-display text-xl font-bold text-charcoal">रचना (composed) मजकूर</h2>
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
            <ComposedCopyButtons plain={composed.plainText} whatsapp={composed.whatsappText} />
          </section>
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="preflight-heading" className="surface animate-fade-up p-5">
            <h2 id="preflight-heading" className="font-display text-lg font-bold text-charcoal">प्री-फ्लाइट तपासणी</h2>
            <p className="mt-1 text-xs text-charcoal-soft">
              छपाईच्या आधी कागद, bleed व रंग तपासले जातात — प्रूफमध्ये दिसणार नाही असे काहीही छापले जात नाही.
            </p>
            <div className="mt-4 rounded-2xl border border-gold/25 bg-ivory-deep/50 p-3">
              <QualityRing score={composed.quality.score} />
              <p className="mt-2 text-center font-display text-sm font-bold text-maroon">
                {toDevanagariDigits(composed.quality.score)}/१००
              </p>
            </div>
            <ul aria-live="polite" className="stagger mt-4 space-y-2 text-sm">
              {printIssues.map((check) => (
                <li key={check.id} className="flex items-start gap-2 rounded-xl border border-gold/15 bg-white px-3 py-2.5 shadow-2xs">
                  <span
                    aria-hidden
                    className={
                      check.status === 'pass'
                        ? 'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-paithani text-xs text-ivory'
                        : check.status === 'warn'
                          ? 'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-deep text-xs text-ivory'
                          : 'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-maroon text-xs text-ivory'
                    }
                  >
                    {check.status === 'pass' ? '✓' : '!'}
                  </span>
                  <span>
                    <span className="font-semibold text-charcoal">{check.label}</span>
                    {check.detail ? <span className="block text-xs text-charcoal-soft">{check.detail}</span> : null}
                    <span className="sr-only">{check.status === 'pass' ? 'उत्तीर्ण' : check.status === 'warn' ? 'सूचना' : 'त्रुटी'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div id="print-order" className="scroll-mt-24">
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
              paper={paper}
              finishing={finishing}
            />
          </div>
        </aside>
      </div>

      <p className="mt-6 text-xs text-charcoal-soft">
        एकच Design JSON (v3) → SVG प्रीव्ह्यू, प्रिंट प्रूफ (bleed + crop marks) आणि डिजिटल पान. मजकूर कधीही प्रतिमेत गुंडाळला जात नाही,
        म्हणून शोध व स्क्रीन-रीडर दोन्ही चालतात. अंदाजे कागद खर्च {devRupees(quote.unitPricePaise)}/कार्ड.
      </p>
    </div>
  );
}
