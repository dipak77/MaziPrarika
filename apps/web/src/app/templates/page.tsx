import { Suspense } from "react";
import type { Metadata } from "next";
import { TemplatesCatalogClient } from "@/components/templates-catalog-client";

export const metadata: Metadata = {
  title: "सर्व पत्रिका डिझाईन्स व टेम्पलेट्स — माझी पत्रिका",
  description:
    "विवाह, साखरपुडा, पूजा, गृहप्रवेश, सत्यनारायण व कौटुंबिक सोहळ्यांसाठी ५०+ राजेशाही मराठी पत्रिका टेम्पलेट्स. थेट संपादन करा किंवा प्रिंट-रेडी डाऊनलोड करा.",
};

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory py-12" />}>
      <TemplatesCatalogClient />
    </Suspense>
  );
}
