import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[24px] border border-cyan-200/15 bg-[#061a22]/90 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,.24)] ring-1 ring-white/[0.03] backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
