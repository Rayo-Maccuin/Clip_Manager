"use client";

import type { Clip } from "@/lib/types";
import { buildVideoMomentTarget } from "@/lib/video-moment";

export function WatchMomentButton({
  clip,
  vodUrl,
  compact: _compact = false,
  className = "",
}: {
  clip: Pick<Clip, "timestamp" | "duration">;
  vodUrl: string;
  compact?: boolean;
  className?: string;
}) {
  const target = buildVideoMomentTarget(vodUrl, clip, "localhost");

  if (target.action === "open") {
    return null;
  }

  const accessibleLabel = target.explanation
    ? `${target.label}. ${target.explanation}`
    : target.label;
  const label = target.label;

  return (
    <a
      href={target.url}
      target="_blank"
      rel="noopener noreferrer"
      title={accessibleLabel}
      aria-label={accessibleLabel}
      className={[
        "relative inline-flex items-center justify-center overflow-hidden border border-transparent bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        "pl-6 pr-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider min-h-[24px] rounded-full gap-1 max-w-[180px]",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      ].join(" ")}
    >
      <span className="relative z-10 truncate">{label}</span>

      <span
        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-0 shrink-0"
        aria-hidden="true"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </a>
  );
}