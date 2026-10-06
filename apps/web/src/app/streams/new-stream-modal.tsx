"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonClass } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useAuthUser } from "@/lib/auth-context";
import { notifyToast } from "@/lib/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

function defaultStartValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

type NewStreamModalProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export default function NewStreamModal({
  triggerLabel = "Nuevo stream",
  triggerClassName,
  isOpen: externalOpen,
  onClose: externalOnClose,
}: NewStreamModalProps) {
  const router = useRouter();
  const user = useAuthUser();
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [vodUrl, setVodUrl] = useState("");
  const [startNow, setStartNow] = useState(true);
  const [startedAt, setStartedAt] = useState(defaultStartValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  function handleClose() {
    if (!isSubmitting) {
      if (isControlled) {
        externalOnClose?.();
      } else {
        setInternalOpen(false);
      }
      setError(null);
      setSuccess(false);
    }
  }

  function handleOpen() {
    setStartedAt(defaultStartValue());
    setStartNow(true);
    setTitle("");
    setVodUrl("");
    setError(null);
    setSuccess(false);
    if (isControlled) {
      // let caller control
    } else {
      setInternalOpen(true);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const cleanTitle = title.trim();
    let cleanUrl = vodUrl.trim();

    if (!cleanTitle) {
      setError("Introduce un título para el stream.");
      return;
    }

    if (!cleanUrl) {
      setError("Introduce la URL del stream o VOD.");
      return;
    }

    // Auto-fix URL if missing protocol
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      const parsedUrl = new URL(cleanUrl);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") throw new Error();
      cleanUrl = parsedUrl.toString();
    } catch {
      setError("Introduce una URL válida del stream o VOD.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: { title: string; vodUrl: string; startedAt?: string } = {
      title: cleanTitle,
      vodUrl: cleanUrl,
    };

    if (!startNow && startedAt) {
      payload.startedAt = new Date(startedAt).toISOString();
    } else {
      payload.startedAt = new Date().toISOString();
    }

    try {
      const response = await fetch(`${API_URL}/streams`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.message
            ? Array.isArray(errorData.message)
              ? errorData.message.join(", ")
              : errorData.message
            : "No fue posible crear el stream. Revisa los datos.",
        );
        setIsSubmitting(false);
        return;
      }

      const stream = (await response.json()) as { id: string };
      setSuccess(true);
      notifyToast("Stream creado correctamente.");

      // Brief feedback before navigating
      setTimeout(() => {
        handleClose();
        router.push(`/streams/${stream.id}`);
        router.refresh();
      }, 500);
    } catch {
      setError("No fue posible conectar con el servidor de Clip Manager.");
      setIsSubmitting(false);
    }
  }

  if (user?.role !== "ADMIN") return null;

  return (
    <>
      {!isControlled && (
        <button
          type="button"
          onClick={handleOpen}
          className={triggerClassName ?? buttonClass({ variant: "primary" })}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>{triggerLabel}</span>
        </button>
      )}

      {open && (
        <Modal isOpen={open} onClose={handleClose} labelledBy="new-stream-modal-title">
          <header className="cm-modal__header">
            <div className="min-w-0">
              <p className="cm-modal__eyebrow">Nuevo stream</p>
              <h2 id="new-stream-modal-title" className="cm-modal__title">
                Registrar transmisión
              </h2>
              <p className="mt-1 text-[11px] text-[#737373]">
                Se sincronizará en tiempo real con todo el equipo de moderación.
              </p>
            </div>
            <button type="button" onClick={handleClose} disabled={isSubmitting} aria-label="Cerrar" className="cm-modal__close">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
            <div className="cm-field">
              <label htmlFor="stream-title" className="cm-field__label">
                Título del stream
              </label>
              <input
                id="stream-title"
                type="text"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                placeholder="Ej. Torneo Valorant - Finales del Viernes"
                className="cm-input"
                autoFocus
              />
            </div>

            <div className="cm-field">
              <label htmlFor="stream-url" className="cm-field__label">
                URL del Stream o VOD
              </label>
              <input
                id="stream-url"
                type="text"
                inputMode="url"
                required
                value={vodUrl}
                onChange={(e) => setVodUrl(e.target.value)}
                disabled={isSubmitting}
                placeholder="https://kick.com/canal/videos/... o https://www.twitch.tv/streamer"
                className="cm-input"
              />
              <p className="cm-field__hint" id="stream-url-hint">
                Puedes associar la URL del VOD final más tarde; los clips siempre siguen la URL del stream.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-[#242424] bg-[#080808] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="start-now-checkbox" className="cursor-pointer text-xs font-medium text-[#F5F5F5]">
                  Iniciar contador ahora mismo
                </label>
                <input
                  id="start-now-checkbox"
                  type="checkbox"
                  checked={startNow}
                  onChange={(e) => setStartNow(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#E50914]"
                />
              </div>

              {!startNow && (
                <div className="cm-field">
                  <label htmlFor="stream-start" className="cm-field__label">
                    Fecha y hora de inicio real
                  </label>
                  <input
                    id="stream-start"
                    type="datetime-local"
                    value={startedAt}
                    onChange={(e) => setStartedAt(e.target.value)}
                    disabled={isSubmitting}
                    className="cm-input cm-input--mono"
                  />
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="cm-field__error">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="flex items-center gap-2 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 p-3 text-xs text-[#22C55E]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Stream creado. Abriendo sala de control...</span>
              </p>
            )}

            <footer className="cm-modal__footer">
              <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                loadingLabel="Creando stream..."
                disabled={!title.trim() || !vodUrl.trim()}
              >
                Crear stream
              </Button>
            </footer>
          </form>
        </Modal>
      )}
    </>
  );
}
