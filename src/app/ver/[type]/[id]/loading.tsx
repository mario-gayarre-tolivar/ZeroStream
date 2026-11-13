import { Skeleton } from "@/components/ui/Skeleton";
import { Loader2 } from "lucide-react";

export default function PlayerLoading() {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Player Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-poster" />
        <Skeleton className="h-7 w-64 rounded-poster" />
      </div>

      {/* 16:9 Aspect Video Player Skeleton */}
      <div className="relative aspect-video w-full rounded-poster border border-border bg-black flex flex-col items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-accent" />
        <p className="mt-3 text-sm text-muted">Preparando servidor y stream de video...</p>
      </div>

      {/* Episode Selector Skeleton */}
      <div className="rounded-poster border border-border bg-surface p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <Skeleton className="h-4 w-36 rounded-poster" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-poster" />
            <Skeleton className="h-7 w-24 rounded-poster" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-poster" />
          ))}
        </div>
      </div>

      {/* Content Details Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 rounded-poster border border-border bg-surface p-6 sm:p-8">
        <Skeleton className="aspect-[2/3] w-48 sm:w-full rounded-poster" />
        <div className="md:col-span-3 space-y-4">
          <Skeleton className="h-8 w-3/4 rounded-poster" />
          <div className="flex gap-3">
            <Skeleton className="h-6 w-16 rounded-poster" />
            <Skeleton className="h-6 w-20 rounded-poster" />
            <Skeleton className="h-6 w-24 rounded-poster" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-chip" />
            <Skeleton className="h-6 w-20 rounded-chip" />
            <Skeleton className="h-6 w-16 rounded-chip" />
          </div>
          <Skeleton className="h-24 w-full rounded-poster mt-4" />
        </div>
      </div>
    </div>
  );
}
