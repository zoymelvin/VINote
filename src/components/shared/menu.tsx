import * as React from "react";
import { Icon } from "@/components/icons";

interface MenuProps {
  children: React.ReactNode;
}

export function Menu({ children }: MenuProps) {
  return (
    <ul className="space-y-0.5">
      {React.Children.map(children, (child, i) => (
        <li>{React.cloneElement(child as React.ReactElement<any>, { index: i })}</li>
      ))}
    </ul>
  );
}

interface MenuItemProps {
  icon?: React.ComponentType<{ size?: number; weight?: string; className?: string }>;
  label: string;
  danger?: boolean;
  onClick?: () => void;
  asChild?: React.ReactElement;
  separator?: boolean;
}

export function MenuItem({ icon, label, danger, onClick, asChild, separator }: MenuItemProps) {
  const Comp = asChild ? asChild.type : "button";
  const props = asChild ? asChild.props : {};
  return (
    <>
      {separator && <li className="my-1.5 border-t border-[var(--border)]" />}
      <li>
        <Comp
          {...props}
          onClick={(e) => { e.stopPropagation(); onClick?.(); }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
            danger ? "text-rose-600" : "",
            asChild ? "" : "hover:bg-[var(--card-muted)]"
          )}
        >
          {icon && <Icon icon={icon} size={18} weight="regular" className={danger ? "text-rose-600" : ""} />}
          <span className="flex-1">{label}</span>
        </Comp>
      </li>
    </>
  );
}
