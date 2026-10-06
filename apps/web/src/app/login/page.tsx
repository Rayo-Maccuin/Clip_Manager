"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { EntrySplash } from "@/components/ui/entry-splash";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPageSplash, setShowPageSplash] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowPageSplash(false), 900);
    return () => window.clearTimeout(timeout);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Introduce tu correo y contraseña.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(response.status === 401 ? "Correo o contraseña incorrectos." : data.message ?? "No fue posible iniciar sesión.");
        return;
      }

      window.sessionStorage.setItem("cm:workspace-entry", "1");
      const next = new URLSearchParams(window.location.search).get("next");
      const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("No fue posible conectar con Clip Manager.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-surface relative min-h-screen overflow-hidden bg-[#050505] text-[#F5F5F5]">
      <div aria-hidden="true" className="login-grid pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="login-trace login-trace--one pointer-events-none" />
      <div aria-hidden="true" className="login-trace login-trace--two pointer-events-none" />

      <div className="login-layout relative mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[1.08fr_.92fr]">
        <section className="login-brand flex flex-col justify-between px-6 py-7 sm:px-10 sm:py-9 lg:min-h-screen lg:px-16 lg:py-12 xl:px-20">
          <div className="login-brand__top flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A3A3A3]">Workspace compartido</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">Clip Manager</p>
            </div>
            <span className="login-version">CM <span>·</span> 01</span>
          </div>

          <div className="login-brand__body">
            <div className="login-brand__hero">
              <div className="login-mark-stage" aria-label="Logo oficial de Clip Manager">
                <span className="login-mark-stage__ring login-mark-stage__ring--outer" aria-hidden="true" />
                <span className="login-mark-stage__ring login-mark-stage__ring--inner" aria-hidden="true" />
                <span className="login-mark-stage__tick login-mark-stage__tick--top" aria-hidden="true" />
                <span className="login-mark-stage__tick login-mark-stage__tick--right" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/1.2.png" alt="Clip Manager" className="login-mark-stage__logo" />
                <span className="login-mark-stage__caption">LIVE / MARK / CUT</span>
              </div>

              <div className="login-brand__copy">
                <p className="login-eyebrow"><span /> Contexto · sin ruido</p>
                <h1>Retoma cada directo <span>en el punto exacto.</span></h1>
                <p className="login-brand__description">
                  Marca un instante. Vuelve a él. Convierte el momento en un clip para todo el equipo.
                </p>
              </div>
            </div>

            <ol className="login-flow" aria-label="Flujo de trabajo de Clip Manager">
              <li className="login-flow__item login-flow__item--active">
                <span className="login-flow__marker"><span /></span>
                  <span className="login-flow__time">01</span>
                <span className="login-flow__label">Stream</span>
              </li>
              <li className="login-flow__item">
                <span className="login-flow__marker"><span /></span>
                  <span className="login-flow__time">02</span>
                  <span className="login-flow__label">Timestamp</span>
              </li>
              <li className="login-flow__item">
                <span className="login-flow__marker"><span /></span>
                  <span className="login-flow__time">03</span>
                  <span className="login-flow__label">Momento</span>
                </li>
                <li className="login-flow__item">
                  <span className="login-flow__marker"><span /></span>
                  <span className="login-flow__time">04</span>
                <span className="login-flow__label">Clip</span>
              </li>
            </ol>
          </div>

          <footer className="login-brand__footer">
            <span className="login-brand__footer-mark" aria-hidden="true" />
            <span>Captura <b>/</b> Recuerda <b>/</b> Continúa</span>
            <span className="login-brand__footer-code">CM—REC 001</span>
          </footer>
        </section>

        <section className="login-access flex items-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="login-access__inner login-form-enter mx-auto w-full max-w-[410px]">
            <div className="login-access__heading">
              <div className="login-access__index"><span>01</span><i /></div>
              <p className="login-eyebrow">Acceso al workspace</p>
              <h2>Iniciar sesión</h2>
              <p className="login-access__description">Vuelve al trabajo exactamente donde lo dejaste.</p>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} className="login-form">
              <div className="login-field">
                <label htmlFor="email">Correo electrónico</label>
                <div className="login-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                    placeholder="correo@dominio.com"
                    className="login-input"
                    aria-invalid={Boolean(error)}
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Contraseña</label>
                <div className="login-input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    placeholder="Tu contraseña"
                    className="login-input login-input--password"
                    aria-invalid={Boolean(error)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={showPassword}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="login-eye"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7a11 11 0 0 1-2.2 3.2M6.2 6.2C4.3 7.5 3 9.5 2.5 12c1 2.5 4.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="login-error" role="alert" aria-live="polite">
                  <span aria-hidden="true">!</span>{error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email.trim() || !password}
                className="login-submit"
              >
                <span>{isSubmitting ? "Validando acceso..." : "Entrar al workspace"}</span>
                {isSubmitting ? (
                  <span aria-hidden="true" className="login-submit__spinner" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 12h15m-6-6 6 6-6 6" />
                  </svg>
                )}
              </button>
            </form>

            <div className="login-access__footer">
              <span className="login-access__footer-line" />
              <p>Acceso exclusivo para integrantes autorizados del equipo.</p>
              <span className="login-access__footer-code">PRIVATE / TEAM</span>
            </div>
          </div>
        </section>
      </div>

      {showPageSplash && <EntrySplash label="Preparando Clip Manager" />}
    </main>
  );
}