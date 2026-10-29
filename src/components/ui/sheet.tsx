"use client";
import { useEffect } from "react";
import * as m from "motion/react-m";
import { cn } from "@/lib/utils";

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <m.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(_, info) => { if (info.offset.y > 120) onClose(); }}
        className={cn("absolute bottom-0 left-0 right-0 max-h-[90dvh] overflow-auto rounded-t-[28px] bg-[var(--card)] p-4 safe-bottom")}
      >
        {title && <div className="mb-3 text-lg font-semibold">{title}</div>}
        {children}
      </m.div>
    </div>
  );
}
