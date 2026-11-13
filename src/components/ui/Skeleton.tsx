export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`motion-safe:animate-pulse rounded-poster bg-surface-active/70 ${className}`}
      {...props}
    />
  );
}
