import { Photo } from "./Photo";

export function Logo({
  compact = false,
}: {
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <Photo
      priority
      src={compact ? "/brand/new/logo-icon-only.png" : "/brand/new/logo-full-lockup.png"}
      alt="GHEIR"
      className={`w-auto object-contain object-start ${compact ? "h-14" : "h-[8.25rem]"}`}
    />
  );
}
