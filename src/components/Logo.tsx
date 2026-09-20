export function Logo({
  dark = false,
  compact = false,
}: {
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <img
      src={compact ? "/brand/new/logo-icon-only.png" : "/brand/new/logo-full-lockup.png"}
      alt="GHEIR"
      className={`w-auto object-contain object-left ${compact ? "h-14" : "h-[8.25rem]"}`}
    />
  );
}
