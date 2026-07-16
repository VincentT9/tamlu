import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type BadgeTone = "blue" | "orange" | "green" | "red" | "slate";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

const tones: Record<BadgeTone, string> = {
  blue: "bg-cyan-300/12 text-cyan-100 ring-cyan-200/20",
  orange: "bg-[#f5b85b]/16 text-[#ffd07a] ring-[#f5b85b]/24",
  green: "bg-emerald-300/12 text-emerald-100 ring-emerald-200/20",
  red: "bg-red-300/12 text-red-100 ring-red-200/20",
  slate: "bg-white/8 text-white/72 ring-white/12",
};

export function Badge({ tone = "slate", className, children, ...props }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1", tones[tone], className)} {...props}>
      {children}
    </span>
  );
}
