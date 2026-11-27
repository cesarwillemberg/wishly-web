export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full bg-avatar font-bold text-brand-cream"
      style={{ width: size, height: size, fontSize: size < 32 ? 12 : 14 }}
    >
      {letter}
    </span>
  );
}
