import clsx from "clsx";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-lg bg-slate-200", className ?? "h-24 w-full")} aria-hidden="true" />;
}
