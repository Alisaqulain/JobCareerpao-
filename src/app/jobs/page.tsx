import { Suspense } from "react";
import type { Metadata } from "next";
import JobsPageContent from "./JobsPageContent";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Latest Jobs in India — Apply Online | IT, Hospital, Fresher & Remote",
  description:
    "Search and apply for latest jobs in India on JobCareerPao. IT jobs, hospital jobs, fresher openings, remote work & more. Verified listings with secure online application.",
  path: "/jobs",
  keywords: [
    "latest jobs India",
    "job vacancies",
    "apply jobs online",
    "IT jobs",
    "fresher jobs",
    "remote jobs India",
    "hospital jobs",
    "private jobs",
    "job openings 2026",
  ],
});

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
