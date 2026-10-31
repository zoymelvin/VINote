import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
}

export function Field({ label, error, help, children }: FieldProps) {
  const id = React.useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</label>
      {React.cloneElement(children as React.ReactElement<any>, { id })}
      {(error || help) && <p className="text-xs text-[var(--text-muted)]">{error || help}</p>}
    </div>
  );
}
