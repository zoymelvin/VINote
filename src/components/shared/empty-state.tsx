import * as React from "react";
import { Icon } from "@/components/icons";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon || <Icon icon={require("@phosphor-icons/react").Notebook} size={32} className="text-[var(--accent)]" />}
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-sm text-[var(--text-muted)]">{description}</div>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
