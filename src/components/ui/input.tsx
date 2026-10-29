import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-[16px] outline-none focus:ring-2 focus:ring-[var(--accent)]", props.className)} {...props} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[var(--accent)]", props.className)} {...props} />;
}
