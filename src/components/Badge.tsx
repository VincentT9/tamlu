import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type BadgeTone = "blue" | "orange" | "green" | "red" | "slate";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

const tones: Record<BadgeTone, string> = {
  blue: "bg-[var(--color-green-100)] text-[var(--color-green-800)] ring-[var(--color-border)]",
  orange: "bg-[var(--color-cream-100)] text-[var(--color-green-800)] ring-[var(--color-border)]",
  green: "bg-[var(--color-green-100)] text-[var(--color-green-800)] ring-[var(--color-border)]",
  red: "bg-red-50 text-red-700 ring-red-200",
  slate: "bg-white text-[var(--color-green-800)] ring-[var(--color-border)]",
};

export function Badge({ tone = "slate", className, children, ...props }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1", tones[tone], className)} {...props}>
      {children}
    </span>
  );
}
