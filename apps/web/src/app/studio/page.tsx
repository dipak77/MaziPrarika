import { StudioEditor } from "@/components/studio-editor";
import { Eyebrow } from "@/components/ui";

export const metadata = {
  title: "क्रिएट स्टुडिओ — माझी पत्रिका",
  description: "पैठणी, वारली, शुभ्र व राजमुद्रा टेम्पलेटवर ६० FPS थेट संपादन व क्वालिटी गार्डसह अचूक छपाई.",
};

export default function StudioPage() {
  return (
    <div className="shell py-12">
      <Eyebrow>क्रिएट स्टुडिओ</Eyebrow>
      <h1 className="font-marathi-display text-4xl font-bold text-maroon sm:text-[44px]">
        पत्रिका बनवा — <span className="text-gold-600">हस्तकलेचा ठसा</span>
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-charcoal-soft">
        टेम्पलेट निवडा, तपशील भरा आणि लाइव्ह प्रिव्ह्यू पाहा. नाव कितीही मोठं असलं तरी
        स्मार्ट लेआउट इंजिन त्याला आपोआप सुंदर बसवतं — शून्य ओव्हरफ्लो, १००% प्रिंट रेडी.
      </p>

      <div className="mt-10 border-t border-gold/30 pt-10">
        <StudioEditor />
      </div>
    </div>
  );
}
