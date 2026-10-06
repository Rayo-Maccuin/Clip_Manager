"use client";

import { useEffect, useState } from "react";
import type { ToastKind } from "@/lib/toast";

type ToastItem = {
  id: number;
  message: string;
  kind: ToastKind;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    let nextId = 0;
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<{ message: string; kind: ToastKind }>).detail;
      const id = ++nextId;
      setToasts((current) => [...current.slice(-2), { id, ...detail }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4500);
    }

    window.addEventListener("clip-manager:toast", handleToast);
    return () => window.removeEventListener("clip-manager:toast", handleToast);
  }, []);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div key={toast.id} role={toast.kind === "error" ? "alert" : "status"} className={`pointer-events-auto flex items-start gap-3 rounded-md border bg-[#111111] px-4 py-3 text-sm shadow-xl ${toast.kind === "success" ? "border-[#22C55E]/40 text-[#F5F5F5]" : "border-[#EF4444]/40 text-[#F5F5F5]"}`}>
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${toast.kind === "success" ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} aria-hidden="true" />
            <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
            <button type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Cerrar notificación" className="text-[#737373] hover:text-white">×</button>
          </div>
        ))}
      </div>
    </>
  );
}