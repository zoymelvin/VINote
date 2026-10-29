import * as React from "react";
import { cn } from "@/lib/utils";

export function Chip({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-full bg-[var(--card-muted)] px-3 py-1 text-xs", className)} {...props} />;
}
