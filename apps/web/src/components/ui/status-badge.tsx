import { formatStatusLabel } from "@/lib/format";
import type { ClipStatus } from "@/lib/types";

type StatusTone = "neutral" | "primary" | "warning" | "success" | "info" | "muted";

const statusTones: Record<ClipStatus, StatusTone> = {
  PENDING: "neutral",
  IN_REVIEW: "warning",
  SELECTED: "primary",
  EDITED: "info",
  PUBLISHED: "success",
  DISCARDED: "muted",
};

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-[#303030] bg-[#151515] text-[#D4D4D4]",
  primary: "border-[#E50914]/40 bg-[#E50914]/12 text-[#FF5961]",
  warning: "border-[#F59E0B]/40 bg-[#F59E0B]/12 text-[#F59E0B]",
  success: "border-[#22C55E]/40 bg-[#22C55E]/12 text-[#22C55E]",
  info: "border-[#3B82F6]/40 bg-[#3B82F6]/12 text-[#60A5FA]",
  muted: "border-[#262626] bg-[#111111] text-[#737373]",
};

const toneDots: Record<StatusTone, string> = {
  neutral: "bg-[#737373]",
  primary: "bg-[#E50914]",
  warning: "bg-[#F59E0B]",
  success: "bg-[#22C55E]",
  info: "bg-[#3B82F6]",
  muted: "bg-[#404040]",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: ClipStatus;
  className?: string;
}) {
  const tone = statusTones[status] ?? "neutral";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneClasses[tone]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${toneDots[tone]}`} aria-hidden="true" />
      {formatStatusLabel(status)}
    </span>
  );
}

export function ToneBadge({
  tone,
  children,
  dot,
  className = "",
}: {
  tone: StatusTone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${toneClasses[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${toneDots[tone]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
