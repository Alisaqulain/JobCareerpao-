import { JobCardSkeleton } from "@/components/ui/Skeleton";

export default function JobsLoading() {
  return (
    <div className="min-h-screen bg-brand-gray py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
