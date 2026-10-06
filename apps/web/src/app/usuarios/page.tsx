import { AppShell } from "@/components/navigation/app-shell";
import UsuariosPage, { type Usuario } from "@/components/users/usuarios-page";
import { BackButton } from "@/components/navigation/back-button";
import { apiFetch } from "@/lib/server-api";

async function getUsuarios(): Promise<Usuario[]> {
  const response = await apiFetch("/usuarios", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No fue posible cargar los usuarios.");
  }

  return response.json() as Promise<Usuario[]>;
}

export default async function UsuariosRoutePage() {
  let usuarios: Usuario[] = [];
  let error: string | null = null;

  try {
    usuarios = await getUsuarios();
  } catch {
    error = "No fue posible cargar la información de usuarios.";
  }

  return (
    <AppShell>
      <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-8 pb-24 lg:pb-12 max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#262626] pb-6">
          <div>
            <BackButton fallbackHref="/" label="Volver al Inicio" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#737373]">
              Administración
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Usuarios
            </h1>
            <p className="mt-1 text-xs text-[#A3A3A3]">
              Gestión de cuentas del workspace: crea, desactiva y revisa el estado de cada usuario.
            </p>
          </div>
        </div>

        <UsuariosPage initialUsuarios={usuarios} initialError={error} />
      </main>
    </AppShell>
  );
}
