import { Metadata } from "next";
import { DaromaDashboard } from "@/components/daroma-dashboard";

export const metadata: Metadata = {
  title: "Dashboard & Analytics | Daroma Modern Studio | MaziPatrika",
  description:
    "Comprehensive SaaS studio analytics, real-time accounting, project tracking, and daily schedule management built with Daroma modern design system.",
};

export default function DashboardPage() {
  return <DaromaDashboard />;
}
