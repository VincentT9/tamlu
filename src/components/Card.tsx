import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white p-5 shadow-soft", className)} {...props}>
      {children}
    </div>
  );
}
