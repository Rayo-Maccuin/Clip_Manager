import { formatCompactDuration, formatTimestamp } from "@/lib/format";

type ClipTimeRangeProps = {
  timestamp: number;
  duration: number;
  variant?: "stack" | "inline";
  className?: string;
};

export function ClipTimeRange({
  timestamp,
  duration,
  variant = "stack",
  className = "",
}: ClipTimeRangeProps) {
  const start = Math.max(0, Math.floor(timestamp));
  const end = start + Math.max(0, Math.floor(duration));

  if (variant === "inline") {
    return (
      <span className={`font-mono text-xs font-semibold text-[#E50914] ${className}`}>
        {formatTimestamp(start)}
        <span className="mx-1 text-[#525252]" aria-hidden="true">
          →
        </span>
        {formatTimestamp(end)}
        <span className="ml-2 font-sans text-[10px] font-medium text-[#737373]">
          {formatCompactDuration(duration)}
        </span>
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className="font-mono text-[13px] font-bold tracking-tight text-[#E50914]">
        {formatTimestamp(start)}
        <span className="mx-1.5 text-[#525252]" aria-hidden="true">
          →
        </span>
        {formatTimestamp(end)}
      </span>
      <span className="rounded border border-[#242424] bg-[#111111] px-1.5 py-px font-mono text-[10px] font-semibold text-[#A3A3A3]">
        {formatCompactDuration(duration)}
      </span>
    </div>
  );
}
