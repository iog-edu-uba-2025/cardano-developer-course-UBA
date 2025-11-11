export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-800/40 p-5">
      <div>
        <h3 className="text-lg font-semibold leading-tight text-neutral-100">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}
