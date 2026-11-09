import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 w-full animate-fadeIn">
      {/* Hero Banner Skeleton */}
      <div className="relative h-[360px] sm:h-[420px] md:h-[460px] w-full rounded-2xl border border-border bg-surface p-8 sm:p-12 flex flex-col justify-end gap-4 overflow-hidden">
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="h-10 sm:h-12 w-3/4 max-w-xl rounded-lg" />
        <Skeleton className="h-16 w-full max-w-2xl rounded-md" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </div>

      {/* Row Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-2"
            >
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded mt-1" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-10 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
