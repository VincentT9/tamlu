import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm font-medium text-slate-800" htmlFor={inputId}>
      {label ? <span className="mb-1.5 block">{label}</span> : null}
      <input
        id={inputId}
        className={clsx(
          "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-water-500 focus:ring-2 focus:ring-water-100",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
