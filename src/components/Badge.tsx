import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type BadgeTone = "blue" | "orange" | "green" | "red" | "slate";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

const tones: Record<BadgeTone, string> = {
  blue: "bg-water-50 text-water-700 ring-water-100",
  orange: "bg-rescue-50 text-rescue-600 ring-rescue-50",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function Badge({ tone = "slate", className, children, ...props }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1", tones[tone], className)} {...props}>
      {children}
    </span>
  );
}
