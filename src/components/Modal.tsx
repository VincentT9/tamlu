import type { ReactNode } from "react";
import clsx from "clsx";
import { Button } from "@/components/Button";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

export function Modal({ open, title, children, onClose, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true">
      <div className={clsx("w-full max-w-lg rounded-xl bg-white p-5 shadow-soft", className)}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <Button type="button" variant="ghost" className="min-h-9 px-3" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
