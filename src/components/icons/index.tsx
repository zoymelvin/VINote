import { IconWeight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{ size?: number; weight?: IconWeight; className?: string; [key: string]: unknown }>;

export function Icon({ icon: IconComp, size = 20, weight = "regular", className, label, decorative = !label, style }: { icon: IconComponent; size?: number; weight?: IconWeight; className?: string; label?: string; decorative?: boolean; style?: React.CSSProperties }) {
  return (
    <span style={style}>
      <IconComp
        size={size}
        weight={weight}
        aria-hidden={decorative ? true : undefined}
        aria-label={label}
        className={cn("shrink-0", className)}
      />
    </span>
  );
}

export function IconTile({ icon: IconComp, className, label, gradient }: { icon: IconComponent; className?: string; label?: string; gradient?: string }) {
  return (
    <div
      className={cn("flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm", gradient ? `bg-gradient-to-br ${gradient}` : "bg-[var(--card-muted)] text-[var(--text-muted)]", className)}
      aria-label={label}
      role="img"
    >
      <Icon icon={IconComp} size={18} weight="duotone" decorative={!!label} />
    </div>
  );
}
