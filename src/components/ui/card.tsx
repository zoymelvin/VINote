import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[var(--radius)] bg-[var(--card)] shadow-[var(--shadow-1)] border border-[var(--border)]", className)} {...props}>
      {children}
    </div>
  );
}
