"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  formatDate,
  formatElapsedDuration,
} from "@/lib/format";
import type { Clip, Stream, Tag } from "@/lib/types";
import { ClipTimeRange } from "@/components/clips/clip-time-range";
import { MarkMomentModal } from "@/components/clips/mark-moment-modal";
import { WatchMomentButton } from "@/components/clips/watch-moment-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button, buttonClass } from "@/components/ui/button";
import NewStreamModal from "@/app/streams/new-stream-modal";

type HomeDashboardProps = {
  initialStreams: Stream[];
  initialClips: Clip[];
  initialTags?: Tag[];
  initialError: string | null;
};

export function HomeDashboard({
  initialStreams,
  initialClips,
  initialTags = [],
  initialError,
}: HomeDashboardProps) {
  const router = useRouter();
  const [streams] = useState<Stream[]>(initialStreams);
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [tags] = useState<Tag[]>(initialTags);
  const [clockNow, setClockNow] = useState<number>(() => Date.now());

  // Moment marking state
  const [isMarking, setIsMarking] = useState(false);
  const [capturedTimestamp, setCapturedTimestamp] = useState<number>(0);
  const [shortcutFlash, setShortcutFlash] = useState(false);

  // Active stream is the one without endedAt
  const activeStream = streams.find((s) => !s.endedAt) ?? null;

  // Real-time shared clock based on startedAt
  useEffect(() => {
    if (!activeStream) return;

    const interval = window.setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeStream]);

  // Instant capture function
  const triggerMarkMoment = useCallback(() => {
    if (!activeStream || activeStream.endedAt) return;

    const startedTime = new Date(activeStream.startedAt).getTime();
    const timestamp = Math.max(0, Math.floor((Date.now() - startedTime) / 1000));

    setCapturedTimestamp(timestamp);
    setIsMarking(true);
    setShortcutFlash(true);
    setTimeout(() => setShortcutFlash(false), 300);
  }, [activeStream]);

  // Keyboard shortcut 'M'
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isEditing = target instanceof Element && (
        Boolean(target.closest('input, textarea, select, [contenteditable="true"]')) ||
        (target instanceof HTMLElement && target.isContentEditable)
      );

      if (!isEditing && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === "m") {
        if (activeStream && !isMarking) {
          event.preventDefault();
          triggerMarkMoment();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStream, isMarking, triggerMarkMoment]);

  function handleMomentCreated(newClip: Clip) {
    setClips((prev) => [newClip, ...prev]);
  }

  const streamMap = new Map(streams.map((stream) => [stream.id, stream]));
  const recentClips = clips.slice(0, 6);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 pb-24 sm:px-8 sm:py-8 lg:pb-12 xl:px-10">
      {initialError && (
        <div
          className="mb-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-xs text-[#EF4444]"
          role="alert"
        >
          {initialError}
          <button type="button" onClick={() => router.refresh()} className="ml-3 underline underline-offset-2">Reintentar</button>
        </div>
      )}

      {/* SECTION 1: ACTIVE STREAM & CONTROLS */}
      {activeStream ? (
        <section
          className={`relative mb-6 overflow-hidden rounded-2xl border p-5 transition-all duration-300 sm:p-7 ${
            shortcutFlash
              ? "border-[#E50914] shadow-[0_0_34px_rgba(229,9,20,0.35)]"
              : "border-[#242424] bg-[#0D0D0D]"
          }`}
        >
          {/* Subtle red indicator glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#E50914]/[0.07] blur-3xl" />

          <div className="relative">
            {/* Top row: Stream status & stream info */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#242424] pb-5 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E50914] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E50914]" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E50914]">
                    Stream en vivo · Tiempo compartido
                  </span>
                </div>
                <h1 className="mt-2 truncate text-lg font-bold tracking-tight text-[#F5F5F5] sm:text-xl">
                  {activeStream.title}
                </h1>
                <p className="mt-1 text-[11px] text-[#737373]">
                  Todos los moderators comparten el mismo reloj desde el inicio real.
                </p>
              </div>

              <Link
                href={`/streams/${activeStream.id}`}
                className={buttonClass({ variant: "secondary", className: "shrink-0 self-start sm:self-auto" })}
              >
                <span>Centro de control</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Live shared clock + primary action */}
            <div className="flex flex-col justify-between gap-6 py-6 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#737373]">
                  Tiempo transcurrido del stream
                </p>
                <p className="mt-1.5 font-mono text-[clamp(2.5rem,7vw,3.75rem)] font-bold leading-none tracking-tight text-white [text-shadow:0_0_28px_rgba(229,9,20,0.18)]">
                  {formatElapsedDuration(
                    activeStream.startedAt,
                    activeStream.endedAt,
                    clockNow ?? undefined,
                  )}
                </p>
                <p className="mt-2 text-[11px] text-[#525252]">
                  Inicio {formatDate(activeStream.startedAt)}
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 lg:items-end">
                <Button
                  variant="primary"
                  onClick={triggerMarkMoment}
                  className="w-full min-h-[64px] rounded-2xl px-8 text-base font-bold tracking-tight sm:text-lg lg:w-auto"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                  </svg>
                  <span>MARCAR MOMENTO</span>
                </Button>
                <p className="flex items-center gap-1.5 text-[11px] text-[#737373]">
                  <span>Atajo rápido: pulsa</span>
                  <kbd className="rounded border border-[#303030] bg-[#151515] px-1.5 py-0.5 font-mono text-[10px] text-[#F5F5F5]">
                    M
                  </kbd>
                  <span>en el teclado</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* NO ACTIVE STREAM STATE */
        <section className="mb-6 rounded-xl border border-dashed border-[#242424] bg-[#0D0D0D] p-10 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-[#242424] bg-[#111111] text-[#525252]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-base font-bold tracking-tight text-[#F5F5F5]">
              No hay un stream activo actualmente
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#A3A3A3]">
              Inicia o registra la transmisión de hoy para que todo el equipo pueda marcar y etiquetar momentos en tiempo real.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <NewStreamModal triggerLabel="Iniciar nuevo stream" />
              <Link href="/streams" className={buttonClass({ variant: "secondary" })}>
                Ver transmisiones pasadas
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: MOMENTOS RECIENTES */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-[#F5F5F5]">
              Momentos recientes
            </h2>
            <p className="text-[11px] text-[#737373]">
              Clips marcados por el streamer y los moderadores.
            </p>
          </div>
          <Link
            href="/clips"
            className={buttonClass({ variant: "ghost", className: "shrink-0" })}
          >
            <span>Ver todos los clips</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentClips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#242424] bg-[#0D0D0D] p-10 text-center">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-[#242424] bg-[#111111] text-[#525252]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-xs leading-relaxed text-[#737373]">
              Aún no se han marcado momentos. Cuando el stream comience, presiona{" "}
              <span className="font-semibold text-[#F5F5F5]">MARCAR MOMENTO</span> o la tecla{" "}
              <kbd className="rounded border border-[#303030] bg-[#151515] px-1.5 py-0.5 font-mono text-[10px] text-[#F5F5F5]">M</kbd>.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recentClips.map((clip) => {
              const stream = streamMap.get(clip.streamId);
              return (
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

                  <div className="mt-3 flex flex-wrap gap-1">
                    {clip.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded border border-[#242424] bg-[#151515] px-1.5 py-0.5 text-[10px] font-medium text-[#A3A3A3]"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#242424] pt-3">
                    <Link
                      href={stream ? `/streams/${stream.id}` : "/streams"}
                      className="min-w-0 truncate text-[11px] text-[#737373] transition-colors hover:text-[#E50914]"
                    >
                      {stream?.title ?? "Stream"}
                    </Link>
                    {stream && (
                      <WatchMomentButton clip={clip} vodUrl={stream.vodUrl} />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {activeStream && isMarking && (
        <MarkMomentModal
          isOpen={isMarking}
          onClose={() => setIsMarking(false)}
          streamId={activeStream.id}
          capturedTimestamp={capturedTimestamp}
          maxTimestamp={Math.max(0, Math.floor((clockNow - new Date(activeStream.startedAt).getTime()) / 1000))}
          availableTags={tags}
          onMomentCreated={handleMomentCreated}
        />
      )}
    </main>
  );
}