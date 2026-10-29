import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", size = "md", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition active:scale-[0.98] disabled:opacity-50";
  const variants = {
    primary: "bg-[var(--accent)] text-white shadow-[var(--shadow-1)] hover:opacity-95",
    secondary: "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)]",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--card-muted)]",
    danger: "bg-rose-600 text-white",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-11 px-4 text-sm", lg: "h-12 px-5 text-base" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function IconButton({ label, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button aria-label={label} className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl hover:bg-[var(--card-muted)] active:scale-95", className)} {...props} />;
}
