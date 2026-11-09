import { MediaItem } from "@/types";
import { MediaCard } from "./MediaCard";
import { AlertCircle } from "lucide-react";

interface MediaGridProps {
  items: MediaItem[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export function MediaGrid({
  items,
  title,
  subtitle,
  emptyMessage = "No se encontraron títulos disponibles con estos filtros.",
}: MediaGridProps) {
  return (
    <section className="w-full">
      {(title || subtitle) && (
        <div className="mb-6 flex flex-col gap-1">
          {title && <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>}
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 p-8 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-slate-500" />
          <p className="max-w-md text-sm text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <MediaCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
