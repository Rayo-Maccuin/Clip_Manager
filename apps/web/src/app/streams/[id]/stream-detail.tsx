"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  formatDate,
  formatElapsedDuration,
  formatTimestamp,
} from "@/lib/format";
import type { Clip, Stream, Tag } from "@/lib/types";
import { BackButton } from "@/components/navigation/back-button";
import { StreamPlayer } from "@/components/streams/stream-player";
import { ClipTimeRange } from "@/components/clips/clip-time-range";
import { MarkMomentModal } from "@/components/clips/mark-moment-modal";
import { WatchMomentButton } from "@/components/clips/watch-moment-button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuthUser } from "@/lib/auth-context";
import { notifyToast } from "@/lib/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

type StreamDetailProps = {
  stream: Stream | null;
  clips: Clip[];
  tags?: Tag[];
  initialError: string | null;
};

export default function StreamDetail({
  stream: initialStream,
  clips: initialClips,
  tags = [],
  initialError,
}: StreamDetailProps) {
  const router = useRouter();
  const user = useAuthUser();
  const [stream, setStream] = useState<Stream | null>(initialStream);
  const [vodUrlDraft, setVodUrlDraft] = useState(initialStream?.vodUrl ?? "");
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [error] = useState<string | null>(initialError);
  const [clockNow, setClockNow] = useState<number>(() =>
    new Date(initialStream?.endedAt ?? initialStream?.startedAt ?? 0).getTime(),
  );

  // Ending stream state
  const [isEndingStream, setIsEndingStream] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingStream, setIsDeletingStream] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSavingVodUrl, setIsSavingVodUrl] = useState(false);
  const [vodUrlError, setVodUrlError] = useState<string | null>(null);

  // Mark moment state
  const [isMarking, setIsMarking] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = useState<number>(0);
  const [capturedMaxTimestamp, setCapturedMaxTimestamp] = useState<number>(0);
  const [flash, setFlash] = useState(false);

  const isActive = stream ? !stream.endedAt : false;

  // Real-time clock from startedAt
  useEffect(() => {
    if (!stream || stream.endedAt) return;

    const initialTick = window.setTimeout(() => setClockNow(Date.now()), 0);
    const interval = window.setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(interval);
    };
  }, [stream]);

  // Capture moment (opens the full modal)
  const triggerMark = useCallback(() => {
    if (!stream || stream.endedAt) return;

    const startedTime = new Date(stream.startedAt).getTime();
    const timestamp = Math.max(0, Math.floor((Date.now() - startedTime) / 1000));

    setCapturedTimestamp(timestamp);
    setCapturedMaxTimestamp(timestamp);
    setIsMarking(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }, [stream]);

  // Quick mark: capture timestamp instantly without opening the modal
  const quickMark = useCallback(async () => {
    if (!stream || stream.endedAt) return;

    const startedTime = new Date(stream.startedAt).getTime();
    const timestamp = Math.max(0, Math.floor((Date.now() - startedTime) / 1000));

    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    try {
      const response = await fetch(`${API_URL}/streams/${stream.id}/clips`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Momento ${clips.length + 1}`,
          description: "",
          timestamp,
          duration: 30,
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible guardar el momento rápido.");
      }

      const newClip = (await response.json()) as Clip;
      setClips((prev) => [newClip, ...prev]);
      notifyToast(`Momento capturado: ${formatTimestamp(timestamp)}`);
    } catch {
      notifyToast("No fue posible guardar el momento rápido. Intenta de nuevo.", "error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, clips.length, notifyToast]);

  // Shortcut 'M': quick mark (no modal)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isEditing = target instanceof Element && (
        Boolean(target.closest('input, textarea, select, [contenteditable="true"]')) ||
        (target instanceof HTMLElement && target.isContentEditable)
      );

      if (!isEditing && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === "m") {
        if (isActive) {
          event.preventDefault();
          void quickMark();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, quickMark]);

  async function handleEndStream() {
    setShowEndConfirm(true);
  }

  async function handleUpdateVodUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stream || isSavingVodUrl) return;

    const cleanUrl = vodUrlDraft.trim();
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") throw new Error();
    } catch {
      setVodUrlError("Introduce la URL completa del VOD.");
      return;
    }

    setIsSavingVodUrl(true);
    setVodUrlError(null);
    try {
      const response = await fetch(`${API_URL}/streams/${stream.id}/vod`, {
        method: "PATCH",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ vodUrl: parsedUrl.toString() }),
      });
      if (!response.ok) throw new Error();

      const updated = (await response.json()) as Stream;
      setStream(updated);
      setVodUrlDraft(updated.vodUrl);
      notifyToast("VOD actualizado; los clips del stream ya apuntan a esta URL.");
    } catch {
      setVodUrlError("No fue posible actualizar el VOD. Intenta de nuevo.");
    } finally {
      setIsSavingVodUrl(false);
    }
  }

  async function confirmEndStream() {
    if (!stream || !isActive || isEndingStream) return;

    setIsEndingStream(true);
    setEndError(null);

    try {
      const response = await fetch(`${API_URL}/streams/${stream.id}/end`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endedAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error("No fue posible finalizar el stream.");
      }

      const updated = (await response.json()) as Stream;
      setStream(updated);
      notifyToast("Stream finalizado.");
    } catch {
      setEndError("No fue posible finalizar el stream. Intenta de nuevo.");
    } finally {
      setIsEndingStream(false);
      setShowEndConfirm(false);
    }
  }

  async function handleDeleteStream() {
    setShowDeleteConfirm(true);
  }

  async function confirmDeleteStream() {
    if (!stream || isDeletingStream) return;

    setIsDeletingStream(true);
    setDeleteError(null);

    try {
      const response = await fetch(`${API_URL}/streams/${stream.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No fue posible eliminar el stream.");
      }

      notifyToast("Stream eliminado.");
      router.push("/streams");
    } catch {
      setDeleteError("No fue posible eliminar el stream. Intenta de nuevo.");
      setIsDeletingStream(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleMomentCreated(newClip: Clip) {
    setClips((prev) => [newClip, ...prev]);
  }

  if (error || !stream) {
    return (
      <div className="space-y-4">
        <BackButton fallbackHref="/streams" label="Volver a Streams" />
        <div
          className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-6 text-sm text-[#EF4444]"
          role="alert"
        >
          {error ?? "No se encontró el stream solicitado."}
          <button type="button" onClick={() => router.refresh()} className="ml-3 underline underline-offset-2">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top back & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BackButton fallbackHref="/streams" label="Volver a Streams" />

        <div className="flex items-center gap-3">
          {isActive ? (
            user?.role === "ADMIN" ? (
              <button
                type="button"
                onClick={() => void handleEndStream()}
                disabled={isEndingStream}
                className="rounded-lg border border-[#333333] bg-[#171717] px-3.5 py-1.5 text-xs font-medium text-[#A3A3A3] transition-colors hover:border-[#EF4444] hover:text-[#EF4444] disabled:opacity-50"
              >
                {isEndingStream ? "Finalizando..." : "Finalizar transmisión"}
              </button>
            ) : (
              <span className="rounded border border-[#E50914]/30 bg-[#E50914]/10 px-3 py-1 text-xs text-[#E50914]">En curso</span>
            )
          ) : (
            <span className="rounded border border-[#262626] bg-[#111111] px-3 py-1 text-xs text-[#737373]">Transmisión concluida</span>
          )}

          {user?.role === "ADMIN" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleDeleteStream()}
              disabled={isDeletingStream}
              title="Eliminar stream"
              aria-label="Eliminar stream"
              icon={
                isDeletingStream ? (
                  <span className="text-[10px] text-[#EF4444]">...</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )
              }
            >
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {endError && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]">
          {endError}
        </div>
      )}
      {deleteError && <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#EF4444]" role="alert">{deleteError}</div>}

      {/* Stream Overview Banner */}
      <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-6 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isActive
                    ? "bg-[#E50914] shadow-[0_0_10px_rgba(229,9,20,0.8)] animate-pulse"
                    : "bg-[#737373]"
                }`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isActive ? "text-[#E50914]" : "text-[#737373]"
                }`}
              >
                {isActive ? "En Vivo · Transmitiendo" : "Stream Finalizado"}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
              {stream.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#737373]">
              <span>Inició: {formatDate(stream.startedAt)}</span>
              {stream.endedAt && <span>· Concluyó: {formatDate(stream.endedAt)}</span>}
            </div>
          </div>

          {/* Real-time duration block */}
          <div className="rounded-xl border border-[#262626] bg-[#111111] p-4 text-center sm:text-right min-w-[200px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373]">
              Duración {isActive ? "actual" : "total"}
            </p>
            <p className="mt-1 font-mono text-3xl font-bold text-white tracking-tight">
              {formatElapsedDuration(
                stream.startedAt,
                stream.endedAt,
                clockNow ?? undefined,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Control Cockpit: Stream Player + Marking Center */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Embed Player (8 cols on desktop) */}
        <div className="lg:col-span-8">
          <StreamPlayer url={stream.vodUrl} title={stream.title} />
        </div>

        {/* Right Column: Instant Marking Box & Stats (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Quick Mark card */}
          <div
            className={`rounded-xl border transition-all duration-300 p-5 sm:p-6 ${
              flash
                ? "border-[#E50914] shadow-[0_0_24px_rgba(229,9,20,0.5)]"
                : "border-[#262626] bg-[#0A0A0A]"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E50914]">
                Captura en directo
              </p>
              <kbd className="rounded border border-[#333333] bg-[#171717] px-1.5 py-0.5 font-mono text-[10px] text-[#A3A3A3]">
                M
              </kbd>
            </div>

            {isActive ? (
              <Button
                variant="primary"
                onClick={triggerMark}
                className="w-full flex-col gap-0.5 rounded-xl px-4 py-6"
              >
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                </svg>
                <span className="text-base font-bold tracking-tight">MARCAR MOMENTO</span>
                <span className="text-[11px] font-normal text-white/80">
                  Captura el timestamp actual al instante
                </span>
              </Button>
            ) : (
              <div className="rounded-xl border border-[#242424] bg-[#111111] p-5 text-center text-xs text-[#737373]">
                El stream ha finalizado. Los momentos quedan registrados para edición.
              </div>
            )}

            <div className="mt-5 border-t border-[#262626] pt-4 flex items-center justify-between text-xs text-[#737373]">
              <span>Clips registrados</span>
              <span className="font-semibold text-white">{clips.length}</span>
            </div>
          </div>

          {/* Quick links & summary */}
          <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 text-xs space-y-3">
            <p className="font-semibold uppercase tracking-wider text-[#A3A3A3]">
              Workspace Compartido
            </p>
            <p className="text-[#737373] leading-relaxed">
              Todos los moderadores y el streamer ven la misma lista de momentos en este stream.
            </p>
            {user?.role === "ADMIN" && !isActive && (
              <form onSubmit={(event) => void handleUpdateVodUrl(event)} className="border-t border-[#262626] pt-4">
                <label htmlFor="stream-vod-url" className="mb-2 block text-[11px] font-medium text-[#A3A3A3]">
                  URL definitiva del VOD
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="stream-vod-url"
                    type="url"
                    required
                    value={vodUrlDraft}
                    onChange={(event) => setVodUrlDraft(event.target.value)}
                    disabled={isSavingVodUrl}
                    className="min-w-0 flex-1 rounded-md border border-[#303030] bg-[#080808] px-3 py-2 text-xs text-white outline-none focus:border-[#E50914] disabled:opacity-60"
                    aria-describedby={vodUrlError ? "stream-vod-url-error" : undefined}
                  />
                  <Button
                    type="submit"
                    disabled={isSavingVodUrl || vodUrlDraft.trim() === stream.vodUrl}
                    isLoading={isSavingVodUrl}
                    loadingLabel="Guardando..."
                  >
                    {isSavingVodUrl ? "Guardando..." : "Actualizar VOD"}
                  </Button>
                </div>
                {vodUrlError && <p id="stream-vod-url-error" className="mt-2 text-[11px] text-[#EF4444]" role="alert">{vodUrlError}</p>}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* CLIPS SECTION */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#F5F5F5]">
              Momentos de esta transmisión ({clips.length})
            </h2>
            <p className="text-xs text-[#737373]">
              Cronología de clips y marcas capturadas.
            </p>
          </div>
        </div>

        {clips.length === 0 ? (
          <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-10 text-center text-xs text-[#737373]">
            No hay momentos marcados para este stream todavía. Pulsa{" "}
            <span className="text-white font-semibold">MARCAR MOMENTO</span> para capturar el primero.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {clips.map((clip) => (
              <article
                key={clip.id}
                className="group flex flex-col rounded-xl border border-[#242424] bg-[#0D0D0D] p-4 transition-all duration-200 hover:border-[#303030] hover:bg-[#111111]"
              >
                <div className="flex items-start justify-between gap-2">
                  <ClipTimeRange timestamp={clip.timestamp} duration={clip.duration} />
                  <StatusBadge status={clip.status} />
                </div>

                <Link
                  href={`/clips/${clip.id}`}
                  className="mt-3 text-sm font-semibold text-[#F5F5F5] leading-snug line-clamp-2 transition-colors group-hover:text-white"
                >
                  {clip.title}
                </Link>

                {clip.description && (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#737373] line-clamp-2">
                    {clip.description}
                  </p>
                )}

                {clip.tags && clip.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {clip.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded border border-[#242424] bg-[#151515] px-1.5 py-0.5 text-[10px] font-medium text-[#A3A3A3]"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-end gap-2 border-t border-[#242424] pt-3">
                  <WatchMomentButton clip={clip} vodUrl={stream.vodUrl} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Mark Moment Modal */}
      {isMarking && (
        <MarkMomentModal
          isOpen={isMarking}
          onClose={() => setIsMarking(false)}
          streamId={stream.id}
          capturedTimestamp={capturedTimestamp}
          maxTimestamp={capturedMaxTimestamp}
          streamHasEnded={!isActive}
          availableTags={tags}
          onMomentCreated={handleMomentCreated}
        />
      )}

      <ConfirmationModal
        isOpen={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={() => confirmEndStream()}
        title="Finalizar transmisión"
        message="¿Deseas finalizar la transmisión? El contador se detendrá y no se podrán marcar nuevos momentos en vivo."
        confirmLabel="Finalizar stream"
        isConfirming={isEndingStream}
        destructive
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => confirmDeleteStream()}
        title="Eliminar stream"
        message="¿Estás seguro de eliminar este stream? Esta acción no se puede deshacer y se eliminarán todos los clips asociados."
        confirmLabel="Eliminar stream"
        isConfirming={isDeletingStream}
        destructive
      />
    </div>
  );
}
