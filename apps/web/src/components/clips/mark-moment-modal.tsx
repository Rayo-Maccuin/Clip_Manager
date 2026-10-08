"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatCompactDuration, formatTimestamp, parseTimestamp } from "@/lib/format";
import type { Clip, Tag } from "@/lib/types";
import { notifyToast } from "@/lib/toast";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";


const DURATION_PRESETS = [15, 30, 45, 60, 90];

type RangeMode = "quick" | "custom";

type MarkMomentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
  capturedTimestamp: number;
  maxTimestamp?: number;
  streamHasEnded?: boolean;
  availableTags?: Tag[];
  onMomentCreated: (clip: Clip) => void;
};

export function MarkMomentModal({
  isOpen,
  onClose,
  streamId,
  capturedTimestamp,
  maxTimestamp,
  streamHasEnded = false,
  availableTags = [],
  onMomentCreated,
}: MarkMomentModalProps) {
  const [mode, setMode] = useState<RangeMode>("quick");
  const [startInput, setStartInput] = useState("00:00:00");
  const [endInput, setEndInput] = useState("00:00:30");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The previous version reset the form from an effect keyed on `capturedTimestamp`.
  // Both the dashboard and the stream detail pass a `maxTimestamp`/`capturedTimestamp`
  // that advances every second while the stream is live, so that effect re-ran on every
  // tick and wiped the title the user was typing — leaving "Guardar momento" disabled
  // forever. Reset only on the closed -> open transition, and freeze the captured value.
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const start = Math.max(0, Math.floor(capturedTimestamp));
      setMode("quick");
      setStartInput(formatTimestamp(start));
      setEndInput(formatTimestamp(start + DURATION_PRESETS[1]));
      setTitle("");
      setDescription("");
      setSelectedTagIds([]);
      setError(null);
      setIsSubmitting(false);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, capturedTimestamp]);

  const startSeconds = parseTimestamp(startInput);
  const endSeconds = parseTimestamp(endInput);
  const derivedDuration =
    startSeconds !== null && endSeconds !== null ? endSeconds - startSeconds : null;

  function closeModal() {
    if (isSubmitting) return;
    onClose();
  }

  function applyDurationPreset(seconds: number) {
    if (startSeconds === null) return;
    setEndInput(formatTimestamp(startSeconds + seconds));
  }

  function handleModeChange(nextMode: RangeMode) {
    setMode(nextMode);
    setError(null);

    if (nextMode === "custom" && startSeconds !== null && derivedDuration !== null && derivedDuration > 0) {
      setEndInput(formatTimestamp(startSeconds + derivedDuration));
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError("Introduce un título para el momento.");
      return;
    }

    if (startSeconds === null || startSeconds < 0) {
      setError("Introduce un inicio válido en formato HH:MM:SS.");
      return;
    }

    if (endSeconds === null) {
      setError("Introduce un fin válido en formato HH:MM:SS.");
      return;
    }

    if (endSeconds <= startSeconds) {
      setError("El fin del clip debe ser posterior al inicio.");
      return;
    }

    const duration = endSeconds - startSeconds;

    if (maxTimestamp !== undefined && startSeconds > maxTimestamp) {
      setError("El inicio no puede superar el tiempo transcurrido del stream.");
      return;
    }

    if (streamHasEnded && maxTimestamp !== undefined && endSeconds > maxTimestamp) {
      setError("El rango del clip no puede superar la duración total del stream.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/streams/${streamId}/clips`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          description: description.trim() || undefined,
          timestamp: startSeconds,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible guardar el momento en el servidor.");
      }

      const createdClip = (await response.json()) as Clip;
      const tagResults = await Promise.allSettled(
        selectedTagIds.map((tagId) =>
          fetch(`/api/clips/${createdClip.id}/tags/${tagId}`, {
            method: "POST",
            credentials: "include",
          }),
        ),
      );
      const attachedTagIds = tagResults.flatMap((result, index) =>
        result.status === "fulfilled" && result.value.ok ? [selectedTagIds[index]] : [],
      );

      onMomentCreated({
        ...createdClip,
        tags: availableTags.filter((tag) => attachedTagIds.includes(tag.id)),
      });
      notifyToast("Momento guardado.");
      if (attachedTagIds.length < selectedTagIds.length) {
        notifyToast("El clip se guardó, pero no se vincularon todas las etiquetas.", "error");
      }
      onClose();
    } catch {
      setError("No fue posible guardar el momento. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRangeValid = startSeconds !== null && endSeconds !== null && endSeconds > startSeconds;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} labelledBy="mark-moment-title">
      <header className="cm-modal__header">
        <div className="min-w-0">
          <p className="cm-modal__eyebrow">Momento capturado</p>
          <h2 id="mark-moment-title" className="cm-modal__title font-mono">
            {startInput || formatTimestamp(capturedTimestamp)}
          </h2>
        </div>
        <button
          type="button"
          onClick={closeModal}
          disabled={isSubmitting}
          aria-label="Cerrar"
          className="cm-modal__close"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
        <div className="cm-field">
          <span className="cm-field__label">Modo de rango</span>
          <div className="cm-segmented" role="group" aria-label="Modo de rango del clip">
            <button
              type="button"
              onClick={() => handleModeChange("quick")}
              disabled={isSubmitting}
              aria-pressed={mode === "quick"}
              className={`cm-segmented__option ${mode === "quick" ? "is-active" : ""}`}
            >
              Rápido
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("custom")}
              disabled={isSubmitting}
              aria-pressed={mode === "custom"}
              className={`cm-segmented__option ${mode === "custom" ? "is-active" : ""}`}
            >
              Personalizado
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="cm-field">
            <label htmlFor="moment-start" className="cm-field__label">
              Inicio
            </label>
            <input
              id="moment-start"
              type="text"
              inputMode="numeric"
              value={startInput}
              onChange={(event) => setStartInput(event.target.value)}
              disabled={isSubmitting}
              placeholder="HH:MM:SS"
              aria-describedby="moment-range-hint"
              className="cm-input cm-input--mono"
            />
          </div>
          <div className="cm-field">
            <label htmlFor="moment-end" className="cm-field__label">
              Fin
            </label>
            <input
              id="moment-end"
              type="text"
              inputMode="numeric"
              value={endInput}
              onChange={(event) => setEndInput(event.target.value)}
              disabled={isSubmitting}
              placeholder="HH:MM:SS"
              aria-describedby="moment-range-hint"
              className="cm-input cm-input--mono"
            />
          </div>
        </div>

        <p id="moment-range-hint" className="cm-field__hint">
          {derivedDuration !== null && derivedDuration > 0 ? (
            <>
              Duración calculada{" "}
              <span className="font-mono font-semibold text-[#A3A3A3]">
                {formatTimestamp(derivedDuration)}
              </span>{" "}
              ({formatCompactDuration(derivedDuration)})
            </>
          ) : (
            "Introduce un fin posterior al inicio para calcular la duración."
          )}
          {maxTimestamp !== undefined && (
            <>
              {" · "}
              Tiempo del stream: <span className="font-mono">{formatTimestamp(maxTimestamp)}</span>
            </>
          )}
        </p>

        {mode === "quick" && (
          <div className="cm-field">
            <span className="cm-field__label">Duración estimada</span>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((seconds) => {
                const isActive = startSeconds !== null && endSeconds === startSeconds + seconds;
                return (
                  <button
                    key={seconds}
                    type="button"
                    onClick={() => applyDurationPreset(seconds)}
                    disabled={isSubmitting}
                    aria-pressed={isActive}
                    className={`cm-chip ${isActive ? "is-active" : ""}`}
                  >
                    {seconds}s
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="cm-field">
          <label htmlFor="moment-title" className="cm-field__label">
            Título del momento
          </label>
          <input
            id="moment-title"
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
            placeholder="Describe el momento"
            className="cm-input"
            autoFocus
          />
        </div>

        <div className="cm-field">
          <label htmlFor="moment-description" className="cm-field__label">
            Descripción / notas (opcional)
          </label>
          <textarea
            id="moment-description"
            rows={2}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
            className="cm-input"
          />
        </div>

        {availableTags.length > 0 && (
          <fieldset className="cm-field">
            <legend className="cm-field__label">Etiquetas rápidas</legend>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    disabled={isSubmitting}
                    aria-pressed={isSelected}
                    className={`cm-chip cm-chip--tag ${isSelected ? "is-selected" : ""}`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {error && (
          <p role="alert" className="cm-field__error">
            {error}
          </p>
        )}

        <footer className="cm-modal__footer">
          <Button variant="ghost" onClick={closeModal} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!title.trim() || !isRangeValid}
            isLoading={isSubmitting}
            loadingLabel="Guardando..."
          >
            Guardar momento
          </Button>
        </footer>
      </form>
    </Modal>
  );
}
