import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-water-600 text-white shadow-soft hover:bg-water-700 focus:ring-water-500",
  secondary: "bg-rescue-500 text-white shadow-soft hover:bg-rescue-600 focus:ring-rescue-500",
  outline: "border border-slate-200 bg-white text-slate-800 hover:border-water-500 hover:text-water-700 focus:ring-water-500",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-water-500",
  danger: "bg-red-600 text-white shadow-soft hover:bg-red-700 focus:ring-red-500",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
