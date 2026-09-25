import { HomePageClient } from "@/components/home-page-client";

export const metadata = {
  title: "माझी पत्रिका — महाराष्ट्राचा डिजिटल उत्सव आणि पत्रिका मंच",
  description:
    "मराठी कुटुंबांसाठी संपूर्ण कार्यक्रम व्यवस्थापन — पत्रिका स्टुडिओ, मुहूर्त-सुसंगत पंचांग, पडताळलेले विक्रेते, बजेट व पाहुणे व्यवस्थापन एकाच वर्कस्पेसमध्ये.",
  openGraph: {
    title: "माझी पत्रिका — पहिल्या अक्षरापासून शेवटच्या आशीर्वादापर्यंत",
    description:
      "पत्रिका डिझाइन, पंचांग-मुहूर्त, विक्रेते, बजेट व RSVP — महाराष्ट्रीयन सोहळ्यांसाठी एकच जोडलेले वर्कस्पेस.",
    locale: "mr_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function Home() {
  return <HomePageClient />;
}
