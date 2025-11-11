import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function useToasts() {
    const [toasts, setToasts] = useState<
        Array<{ id: string; title: string; desc?: string }>
    >([]);
    function push(title: string, desc?: string) {
        const id = uid("toast");
        setToasts((t) => [...t, { id, title, desc }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
    }
    function Toasts() {
        return (
            <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 grid place-items-center gap-3">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            key={t.id}
                            className="pointer-events-auto w-[520px] max-w-[92vw] rounded-2xl border border-neutral-800/60 bg-green-900 p-4 shadow-lg"
                        >
                            <div className="text-sm font-medium text-neutral-100">
                                {t.title}
                            </div>
                            {t.desc && (
                                <div className="mt-1 text-sm text-neutral-300">{t.desc}</div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        );
    }
    return { push, Toasts };
}

export function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
