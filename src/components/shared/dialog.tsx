"use client";
import * as React from "react";
import { Icon } from "@/components/icons";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[20px] bg-[var(--card)] p-5 shadow-[var(--shadow-2)]">
        {(title || description) && (
          <div className="mb-4">
            {title && <div className="text-lg font-semibold">{title}</div>}
            {description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
