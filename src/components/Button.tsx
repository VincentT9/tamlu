import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#2dd4bf] text-[#031014] shadow-[0_16px_36px_rgba(45,212,191,.22)] hover:bg-[#67e8f9] focus:ring-[#67e8f9]",
  secondary: "bg-[#f5b85b] text-[#102126] shadow-[0_16px_36px_rgba(245,184,91,.22)] hover:bg-[#ffd07a] focus:ring-[#f5b85b]",
  outline: "border border-cyan-200/20 bg-white/[0.045] text-white hover:border-[#67e8f9] hover:bg-[#2dd4bf]/15 hover:text-white focus:ring-[#67e8f9]",
  ghost: "bg-transparent text-white/70 hover:bg-white/10 hover:text-white focus:ring-[#67e8f9]",
  danger: "bg-red-700 text-white shadow-soft hover:bg-red-800 focus:ring-red-500",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#031014]",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
