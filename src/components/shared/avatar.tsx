import * as React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt, initials, size = 40, className }: AvatarProps) {
  const [error, setError] = React.useState(false);
  if (src && !error) {
    return (
      <img
        src={src}
        alt={alt || ""}
        width={size}
        height={size}
        className={className || "rounded-full object-cover"}
        onError={() => setError(true)}
      />
    );
  }
  const initial = initials || alt?.charAt(0) || "?";
  return (
    <div
      className={className || "flex items-center justify-center rounded-full bg-[var(--accent)] text-white font-semibold"}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={alt || ""}
    >
      {initial}
    </div>
  );
}
