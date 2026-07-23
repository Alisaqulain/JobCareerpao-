export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className}`}
      aria-hidden
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-5 h-9 w-28" />
    </div>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <Skeleton className="h-14 w-14" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-full" />
    </div>
  );
}
