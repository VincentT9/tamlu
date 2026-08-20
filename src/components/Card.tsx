import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 text-[var(--color-text)] shadow-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
