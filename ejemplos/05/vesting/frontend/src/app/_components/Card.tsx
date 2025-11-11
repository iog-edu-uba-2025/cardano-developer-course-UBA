export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-800/60 bg-neutral-900 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
