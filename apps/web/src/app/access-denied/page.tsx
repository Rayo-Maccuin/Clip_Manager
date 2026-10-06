import Link from "next/link";
import { AppShell } from "@/components/navigation/app-shell";
import { buttonClass } from "@/lib/button-class";

export default function AccessDeniedPage() {
  return (
    <AppShell>
      <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E50914]">403 · Acceso denegado</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">No tienes permiso para ver esta sección.</h1>
        <p className="mt-2 text-sm text-[#A3A3A3]">La administración de usuarios está reservada para cuentas ADMIN.</p>
        <Link href="/" className={buttonClass({ variant: "secondary", className: "mt-6 w-fit" })}>Volver al inicio</Link>
      </main>
    </AppShell>
  );
}