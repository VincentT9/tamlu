import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm font-semibold text-white/82" htmlFor={inputId}>
      {label ? <span className="mb-1.5 block">{label}</span> : null}
      <input
        id={inputId}
        className={clsx(
          "h-11 w-full rounded-[14px] border border-cyan-200/20 bg-white/[0.055] px-3 text-white outline-none transition placeholder:text-white/34 focus:border-[#67e8f9] focus:ring-4 focus:ring-cyan-300/15",
          error && "border-red-400 focus:border-red-400 focus:ring-red-400/15",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}
