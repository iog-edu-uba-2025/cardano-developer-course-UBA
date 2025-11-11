export function Input({
    label,
    hint,
    ...props
}: {
    label?: string;
    hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="grid gap-2">
            {label && (
                <span className="text-sm font-medium text-neutral-200">{label}</span>
            )}
            <input
                {...props}
                className={`w-full rounded-xl border border-slate-599 bg-neutral-800 !px-5 !py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-slate-400/40 ${props.className || ""}`}
            />

            {hint && <span className="text-xs text-neutral-400">{hint}</span>}
        </label>
    );
}
