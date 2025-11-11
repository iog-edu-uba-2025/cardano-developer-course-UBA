export function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "yellow" | "slate";
}) {
  const tones: Record<string, string> = {
    green:
      "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20",
    red: "bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20",
    yellow:
      "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20",
    slate:
      "bg-neutral-9500/10 text-neutral-300 ring-1 ring-inset ring-slate-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
