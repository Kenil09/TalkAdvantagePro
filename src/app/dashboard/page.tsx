import type { Metadata } from "next";

// Skip static generation for this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TalkAdvantage - Dashboard",
  description: "Manage your recordings and transcripts",
};

export default function DashboardPage() {
  return <div className="min-h-screen bg-background">Dashboard</div>;
}
