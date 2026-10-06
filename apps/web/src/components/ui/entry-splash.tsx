"use client";

export function EntrySplash({ label }: { label: string }) {
  return (
    <div className="entry-splash" role="status" aria-label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/1.2.png" alt="" className="entry-splash__logo" />
      <div className="entry-splash__signal" aria-hidden="true">
        {Array.from({ length: 16 }, (_, barIndex) => (
          <span key={barIndex} style={{ animationDelay: `${barIndex * 35}ms` }} />
        ))}
      </div>
      <span className="entry-splash__label">{label}</span>
    </div>
  );
}