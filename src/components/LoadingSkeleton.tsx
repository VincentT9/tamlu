import clsx from "clsx";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-[18px] bg-[var(--color-green-100)]", className ?? "h-24 w-full")} aria-hidden="true" />;
}
