import { Suspense } from "react";
import JobsPageContent from "./JobsPageContent";
import { JobCardSkeleton } from "@/components/ui/Skeleton";

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
