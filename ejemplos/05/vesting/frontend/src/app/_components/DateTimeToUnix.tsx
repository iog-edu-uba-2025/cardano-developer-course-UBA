import { useId, useRef } from "react";

type Props = {
  dateTime: string;
  setDateTime: (v: string) => void;
  unixTime: number | null;
  setUnixTime: (v: number | null) => void;
  label?: string;
  minNow?: boolean;
};

export default function DateTimeToUnix({
  dateTime,
  setDateTime,
  unixTime,
  setUnixTime,
  label = "Fecha límite",
  minNow = false,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const minValue = minNow ? toLocalDatetimeInputValue(new Date()) : undefined;

  // Dentro del componente
  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;

    const wasReadOnly = el.readOnly;
    if (wasReadOnly) el.readOnly = false;

    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();

    // restaura readOnly en el siguiente tick
    setTimeout(() => {
      if (wasReadOnly) el.readOnly = true;
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateTime(value);
    if (value) setUnixTime(dateTimeToUnix(value));
    else setUnixTime(null);
  };

  return (
    <div className="md:col-span-2">
      <label htmlFor={id} className="grid gap-2">
        <span className="text-sm font-medium text-neutral-200">{label}</span>

        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            type="datetime-local"
            value={dateTime}
            onChange={handleChange}
            readOnly
            min={minValue}
            step={60}
            onKeyDown={(e) => e.preventDefault()}
            onFocus={openPicker}
            onClick={openPicker}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 px-10 py-2 text-sm text-neutral-100 outline-none shadow-sm shadow-black/30
                       placeholder:text-neutral-500
                       hover:border-neutral-500/70
                       focus:border-neutral-400 focus:ring-2 focus:ring-neutral-500/30"
          />

          <button
            type="button"
            onClick={openPicker}
            className="absolute inset-y-0 right-1 my-1 rounded-lg px-3 text-xs font-medium
                       text-neutral-200 bg-neutral-800/70 border border-neutral-700/60
                       hover:bg-neutral-700/70 hover:border-neutral-500
                       focus:outline-none focus:ring-2 focus:ring-neutral-500/30"
            aria-label="Abrir selector de fecha y hora"
          >
            <CalendarIcon className="h-5 w-5 text-neutral-400" />
            Abrir calendario
          </button>
        </div>
      </label>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2">
        <div className="text-sm text-neutral-300">
          <span className="font-medium">Unix time:</span>{" "}
          <span className="tabular-nums">{unixTime ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}

function dateTimeToUnix(datetimeLocal: string): number {
  const d = new Date(datetimeLocal);
  return Math.floor(d.getTime());
}

function toLocalDatetimeInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        className="stroke-current"
      />
      <path d="M8 2v4M16 2v4M3 10h18" className="stroke-current" />
      <style>{`svg { stroke-width: 1.6 }`}</style>
    </svg>
  );
}
