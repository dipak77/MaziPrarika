import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'आम्हाला संपर्क साधा',
  description: 'माझी पत्रिका — शंका, सूचना किंवा भागीदारीसाठी आम्हाला लिहा. मराठीत प्रतिसाद.',
};

const CHANNELS = [
  {
    label: 'व्हॉट्सॲप',
    value: 'माझी पत्रिका सहाय्य केंद्र',
    href: 'https://wa.me/?text=%E0%A4%AE%E0%A4%BE%E0%A4%9D%E0%A5%80%20%E0%A4%AA%E0%A4%A4%E0%A5%8D%E0%A4%B0%E0%A4%BF%E0%A4%95%E0%A4%BE',
    note: 'लवकर प्रतिसाद — उत्सवाच्या तारखांनुसार.',
  },
  {
    label: 'ईमेल',
    value: 'namaskar@mazipatrika.in',
    href: 'mailto:namaskar@mazipatrika.in',
    note: 'तांत्रिक शंका व भागीदारीसाठी.',
  },
  {
    label: 'स्थानिक मदत',
    value: 'पुणे · मुंबई · कोल्हापूर',
    href: '/vendors',
    note: 'छपाई हब व स्थानिक विक्रेत्यांची यादी.',
  },
];

export default function ContactPage() {
  return (
    <main className="shell py-12 md:py-16">
      <header className="surface-elevated mb-10 p-8 md:p-12">
        <p className="kicker">॥ सहर्ष स्वागतम् ॥</p>
        <h1 className="mt-3">आम्हाला लिहा</h1>
        <p className="mt-4 max-w-2xl text-charcoal-soft">
          शंका आहे? सूचना द्यायची आहे? किंवा फक्त नमस्कार सांगायचा आहे? — आम्ही मराठीत उत्तर देतो.
        </p>
      </header>

      <section aria-labelledby="channels-heading" className="grid gap-5 sm:grid-cols-3">
        <h2 id="channels-heading" className="sr-only">
          संपर्क पर्याय
        </h2>
        {CHANNELS.map((channel) => (
          <a
            key={channel.label}
            href={channel.href}
            target={channel.href.startsWith('http') ? '_blank' : undefined}
            rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
            className="surface hover-lift block min-h-[44px] p-6"
          >
            <p className="kicker">{channel.label}</p>
            <p className="mt-2 font-semibold text-maroon">{channel.value}</p>
            <p className="mt-1 text-sm text-charcoal-muted">{channel.note}</p>
          </a>
        ))}
      </section>

      <section className="surface mt-10 p-6 md:p-8">
        <h2 className="text-xl">विक्रेता आहात?</h2>
        <p className="mt-2 text-sm text-charcoal-soft">
          तुमची सेवा महाराष्ट्रातील कुटुंबांपर्यंत पोहोचवण्यासाठी आमच्यासोबत जा — लीड, कोट आणि सेटलमेंट एकाच ठिकाणी.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/vendor" className="btn-base btn-maroon px-6 text-sm">
            विक्रेते म्हणून सुरू करा
          </Link>
          <Link href="/about" className="btn-base btn-ghost px-6 text-sm">
            आमच्याविषयी जाणून घ्या
          </Link>
        </div>
      </section>
    </main>
  );
}
