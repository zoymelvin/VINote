"use client";
import * as React from "react";
import { Icon } from "@/components/icons";

interface ListSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ListSearch({ value, onChange, placeholder }: ListSearchProps) {
  return (
    <div className="relative mb-4">
      <Icon icon={require("@phosphor-icons/react").MagnifyingGlass} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Cari..."}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-base outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </div>
  );
}
