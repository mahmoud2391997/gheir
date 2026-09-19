export function Logo({
  dark = false,
  compact = false,
}: {
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <img
      src={dark ? "/brand/lockup-white.png" : "/brand/lockup-color.png"}
      alt="GHEIR"
      className={`w-auto object-contain object-left ${compact ? "h-14" : "h-[8.25rem]"}`}
    />
  );
}
