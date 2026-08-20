import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-green-700)] text-white shadow-none hover:bg-[var(--color-green-800)] focus:ring-[var(--color-green-600)]",
  secondary: "bg-[var(--color-green-100)] text-[var(--color-green-800)] shadow-none hover:bg-[var(--color-green-200)] focus:ring-[var(--color-green-600)]",
  outline: "border border-[var(--color-border-strong)] bg-white text-[var(--color-green-800)] hover:border-[var(--color-green-600)] hover:bg-[var(--color-green-50)] hover:text-[var(--color-green-800)] focus:ring-[var(--color-green-600)]",
  ghost: "bg-transparent text-[var(--color-green-800)] hover:bg-[var(--color-green-50)] hover:text-[var(--color-green-800)] focus:ring-[var(--color-green-600)]",
  danger: "bg-red-700 text-white shadow-soft hover:bg-red-800 focus:ring-red-500",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-sm font-bold transition duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
