import { Metadata } from "next";
import { DaromaDashboard } from "@/components/daroma-dashboard";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "डॅशबोर्ड व विश्लेषण | Daroma Studio | MaziPatrika",
  description:
    "कार्यक्रम, बुकिंग, हिशेब, प्रकल्प ट्रॅकिंग व दैनंदिन वेळापत्रकाचे सखोल स्टुडिओ विश्लेषण.",
};

export default function DashboardPage() {
  const store = getStore();
  const eventCount = store.events.list({ limit: 1000 }).length;
  const bookingCount = store.bookings.list({ limit: 1000 }).length;
  const currentYear = new Date().getFullYear();

  return (
    <DaromaDashboard
      eventCount={eventCount}
      bookingCount={bookingCount}
      currentYear={currentYear}
    />
  );
}
