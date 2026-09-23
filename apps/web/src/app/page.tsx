const recentClips = [
  {
    timestamp: "02:14",
    title: "Momento increíble",
    duration: "00:30",
    status: "PENDING",
  },
  {
    timestamp: "01:47",
    title: "Reacción inesperada",
    duration: "00:45",
    status: "IN_REVIEW",
  },
  {
    timestamp: "00:58",
    title: "Bug inesperado",
    duration: "00:20",
    status: "SELECTED",
  },
];

const navigation = [
  { label: "Inicio", href: "/", active: true },
  { label: "Streams", href: "/streams", active: false },
  { label: "Clips", href: "/clips", active: false },
  { label: "Tags", href: "/tags", active: false },
];

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    IN_REVIEW: "En revisión",
    SELECTED: "Seleccionado",
  };

  return (
    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300">
      {labels[status] ?? status}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="flex min-h-screen">
        <aside className="hidden w-[15rem] shrink-0 border-r border-slate-800/80 bg-slate-950/50 lg:flex lg:flex-col">
          <div className="flex h-[4.25rem] items-center border-b border-slate-800/80 px-6">
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">
                Clip Manager
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Stream workspace
              </p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-5" aria-label="Navegación principal">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
              Workspace
            </p>

            <div className="space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    item.active
                      ? "bg-indigo-500/10 text-indigo-300"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <span
                    className={`mr-3 h-1.5 w-1.5 rounded-full ${
                      item.active ? "bg-indigo-400" : "bg-slate-700"
                    }`}
                  />
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="border-t border-slate-800/80 p-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-xs font-medium text-slate-300">
                Stream activo
              </p>
              <p className="mt-1 text-xs text-emerald-400">
                Listo para marcar momentos
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="flex h-[4.25rem] shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/30 px-5 backdrop-blur-xl sm:px-8">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Workspace
              </p>
              <h1 className="text-sm font-semibold text-slate-100">
                Inicio
              </h1>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Sin stream activo
              </span>

              <button
                type="button"
                className="rounded-lg border border-slate-700 bg-slate-800/70 px-3.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800"
              >
                Nuevo stream
              </button>
            </div>
          </header>

          <section className="flex-1 overflow-auto px-5 py-6 pb-24 sm:px-8 sm:py-8 lg:px-10 lg:py-10 lg:pb-10">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <p className="mb-2 text-sm text-slate-500">
                  Preparado para el próximo stream
                </p>

                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Captura los momentos que importan.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Marca momentos durante el stream y conviértelos después en
                  clips listos para revisar y preparar.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
                <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/10 sm:p-8">
                  <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

                  <div className="relative">
                    <div className="mb-8 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                          Stream actual
                        </p>

                        <h3 className="mt-2 text-lg font-semibold text-white">
                          Ningún stream activo
                        </h3>

                        <p className="mt-1 max-w-md text-sm leading-5 text-slate-400">
                          Inicia un stream para comenzar a capturar momentos
                          rápidamente.
                        </p>
                      </div>

                      <div className="hidden rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-right sm:block">
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                          Tiempo
                        </p>
                        <p className="mt-0.5 font-mono text-sm text-slate-400">
                          00:00:00
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="group flex min-h-32 w-full flex-col items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-6 py-7 transition-all hover:border-indigo-400/40 hover:bg-indigo-500/15 active:scale-[0.99]"
                    >
                      <span className="text-base font-semibold text-indigo-200">
                        Marcar momento
                      </span>

                      <span className="mt-1.5 text-xs text-indigo-300/60">
                        Registra el timestamp al instante
                      </span>
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        Resumen
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-white">
                        Actividad
                      </h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <span className="text-sm text-slate-400">
                        Streams
                      </span>
                      <span className="text-sm font-medium text-slate-200">
                        0
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                      <span className="text-sm text-slate-400">
                        Clips capturados
                      </span>
                      <span className="text-sm font-medium text-slate-200">
                        0
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Pendientes
                      </span>
                      <span className="text-sm font-medium text-slate-200">
                        0
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      Actividad reciente
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      Últimos momentos
                    </h3>
                  </div>

                  <a
                    href="/clips"
                    className="text-xs font-medium text-slate-400 transition-colors hover:text-slate-200"
                  >
                    Ver todos
                  </a>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
                  <div className="divide-y divide-slate-800/80">
                    {recentClips.map((clip) => (
                      <div
                        key={`${clip.timestamp}-${clip.title}`}
                        className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-slate-800/30 sm:px-5"
                      >
                        <span className="shrink-0 font-mono text-xs text-slate-500">
                          {clip.timestamp}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-200">
                            {clip.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {clip.duration}
                          </p>
                        </div>

                        <StatusBadge status={clip.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </section>

          <nav
            className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800/80 bg-slate-950/90 px-3 py-2 backdrop-blur-xl lg:hidden"
            aria-label="Navegación móvil"
          >
            <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex min-h-12 flex-col items-center justify-center rounded-lg text-[11px] font-medium transition-colors ${
                    item.active
                      ? "bg-indigo-500/10 text-indigo-300"
                      : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
                  }`}
                >
                  <span
                    className={`mb-1 h-1.5 w-1.5 rounded-full ${
                      item.active ? "bg-indigo-400" : "bg-slate-700"
                    }`}
                  />
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </main>
  );
}