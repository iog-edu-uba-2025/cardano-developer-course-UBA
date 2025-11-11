export function Button({
  children,
  onClick,
  kind = "primary",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles: Record<string, string> = {
    primary: "bg-neutral-800 text-neutral-100 hover:bg-neutral-700",
    secondary:
      "bg-neutral-900 text-neutral-100 ring-1 ring-inset ring-neutral-800 hover:bg-neutral-800/60",
    ghost: "bg-transparent text-neutral-300 hover:bg-neutral-800/60",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition ${styles[kind]} disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
