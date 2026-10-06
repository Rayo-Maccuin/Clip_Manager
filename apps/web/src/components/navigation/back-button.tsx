"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  label?: string;
  fallbackHref: string;
};

export function BackButton({ label = "Volver", fallbackHref }: BackButtonProps) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    if (window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className="group inline-flex items-center gap-2 rounded-lg border border-[#262626] bg-[#111111] px-3 py-1.5 text-xs font-medium text-[#A3A3A3] transition-all hover:border-[#333333] hover:bg-[#171717] hover:text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-[#E50914]"
      title={`Regresar: ${label}`}
    >
      <svg
        className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>{label}</span>
    </Link>
  );
}

