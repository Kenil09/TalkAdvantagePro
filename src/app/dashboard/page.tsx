import type { Metadata } from "next";
import Recording from "@/components/recording/Recording";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Skip static generation for this page
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TalkAdvantage - Dashboard",
  description: "Manage your recordings and transcripts",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      Dashboard
      {/* <Button
        variant="destructive"
        size="sm"
        onClick={async () => {
          if (
            confirm(
              "Are you sure you want to delete all Weaviate data? This action cannot be undone."
            )
          ) {
            try {
              const response = await fetch("/api/weaviate/clean", {
                method: "POST",
              });
              if (!response.ok) {
                throw new Error("Failed to clean Weaviate data");
              }
            } catch (error) {
              console.log("Error cleaning Weaviate data:", error);
            }
          }
        }}
        className="h-8 flex items-center gap-1"
        title="Delete all data from Weaviate"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Clean Weaviate</span>
      </Button> */}
      <Recording />
    </div>
  );
}
