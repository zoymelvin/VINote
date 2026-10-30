import * as React from "react";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean; "aria-label"?: string }>;

export function Icon({ icon: IconComp, size = 20, className, label, decorative = !label }: { icon: IconComponent; size?: number; className?: string; label?: string; decorative?: boolean }) {
  return (
    <IconComp
      size={size}
      strokeWidth={1.75}
      aria-hidden={decorative ? true : undefined}
      aria-label={label}
      className={cn("shrink-0", className)}
    />
  );
}