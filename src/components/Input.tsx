import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm font-semibold text-[var(--color-green-800)]" htmlFor={inputId}>
      {label ? <span className="mb-1.5 block">{label}</span> : null}
      <input
        id={inputId}
        className={clsx(
          "h-11 w-full rounded-[14px] border border-[var(--color-border)] bg-white px-3 text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-green-600)] focus:ring-4 focus:ring-[rgba(77,141,22,.14)]",
          error && "border-red-500 text-red-700 focus:border-red-500 focus:ring-red-500/15",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
