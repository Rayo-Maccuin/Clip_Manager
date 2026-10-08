"use client";

import Link from "next/link";
import { useState } from "react";
import type { Stream } from "@/lib/types";
import { formatDate, formatDurationSeconds } from "@/lib/format";
import { ToneBadge } from "@/components/ui/status-badge";
import NewStreamModal from "./new-stream-modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

type StreamsListProps = {
  initialStreams: Stream[];
  initialError: string | null;
};

function formatStreamDuration(startedAt: string, endedAt: string | null) {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
  return formatDurationSeconds(totalSeconds);
}

export default function StreamsList({
  initialStreams,
  initialError,
}: StreamsListProps) {
  const [streams, setStreams] = useState<Stream[]>(initialStreams);
  const [error, setError] = useState(initialError);
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleRetry() {
    setIsRetrying(true);
    setError(null);

    try {
      const response = await fetch(`/api/streams`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No fue posible cargar los streams.");
      }

      const data: Stream[] = await response.json();
      setStreams(data);
    } catch {
      setError("No fue posible cargar los streams. Intenta nuevamente.");
    } finally {
      setIsRetrying(false);
    }
  }

  if (error) {
    return (
      <section
        className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-6 sm:p-8"
        role="alert"
      >
        <p className="text-xs font-semibold text-[#EF4444]">{error}</p>
        <button
          type="button"
          onClick={() => void handleRetry()}
          disabled={isRetrying}
          className="mt-4 rounded-lg border border-[#262626] bg-[#111111] px-4 py-2 text-xs font-medium text-[#F5F5F5] transition-colors hover:border-[#333333] hover:bg-[#171717] disabled:opacity-50"
        >
          {isRetrying ? "Reintentando..." : "Reintentar"}
        </button>
      </section>
    );
  }

  if (streams.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-[#242424] bg-[#0D0D0D] p-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-[#242424] bg-[#111111] text-[#525252]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-[#F5F5F5]">
            No hay streams registrados
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#737373]">
            Registra una nueva transmisión para comenzar a capturar momentos en vivo con todo el equipo.
          </p>
          <div className="mt-6 flex justify-center">
            <NewStreamModal triggerLabel="Registrar primer stream" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Streams registrados" className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#737373]">
        <p>
          {streams.length} {streams.length === 1 ? "stream registrado" : "streams registrados"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {streams.map((stream) => {
          const isActive = !stream.endedAt;
          return (
            <Link
              key={stream.id}
              href={`/streams/${stream.id}`}
              className={`group flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${
                isActive
                  ? "border-[#E50914]/35 bg-[#0D0D0D] hover:border-[#E50914]/70"
                  : "border-[#242424] bg-[#0D0D0D] hover:border-[#303030] hover:bg-[#111111]"
              }`}
            >
              <div>
                {/* Header tag and duration */}
                <div className="flex items-center justify-between gap-3">
                  <ToneBadge tone={isActive ? "primary" : "muted"} dot className={isActive ? "animate-pulse" : ""}>
                    {isActive ? "En vivo" : "Finalizado"}
                  </ToneBadge>

                  <span className="font-mono text-xs text-[#737373]">
                    {formatStreamDuration(stream.startedAt, stream.endedAt)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-4 text-sm font-semibold leading-snug text-[#F5F5F5] transition-colors line-clamp-2 group-hover:text-white">
                  {stream.title}
                </h2>
              </div>

              {/* Footer info */}
              <div className="mt-5 space-y-1 border-t border-[#242424] pt-3 text-[11px] text-[#737373]">
                <div className="flex justify-between gap-3">
                  <span>Inicio</span>
                  <span className="truncate text-[#A3A3A3]">{formatDate(stream.startedAt)}</span>
                </div>
                {stream.endedAt && (
                  <div className="flex justify-between gap-3">
                    <span>Fin</span>
                    <span className="truncate text-[#A3A3A3]">{formatDate(stream.endedAt)}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
