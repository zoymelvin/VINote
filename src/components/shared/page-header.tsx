import * as React from "react";
import { Icon } from "@/components/icons";
import { ArrowLeft } from "@phosphor-icons/react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  back?: boolean;
  onBack?: () => void;
  icon?: React.ReactNode;
}

export function PageHeader({ title, description, actions, back, onBack, icon }: PageHeaderProps) {
  return (
    <header className="mb-6 hidden md:flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={onBack} className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl hover:bg-[var(--card-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
            <Icon icon={ArrowLeft} size={20} weight="regular" />
          </button>
        )}
        {icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl">{icon}</div>}
        <div>
          <h1 className="text-[28px] font-semibold leading-tight md:text-[34px] tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
