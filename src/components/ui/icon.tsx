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

export function IconTile({ icon: IconComp, className, label, gradient }: { icon: IconComponent; className?: string; label?: string; gradient?: string }) {
  return (
    <div
      className={cn("flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm", gradient ? `bg-gradient-to-br ${gradient}` : "bg-[var(--card-muted)] text-[var(--text-muted)]", className)}
      aria-label={label}
      role="img"
    >
      <Icon icon={IconComp} size={18} decorative={!!label} />
    </div>
  );
}
