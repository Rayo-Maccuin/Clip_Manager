"use client";

import { FormEvent, useState } from "react";

export type Usuario = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MODERATOR";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MODERATOR";
  status: "ACTIVE" | "INACTIVE";
};

type UserEditData = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MODERATOR";
  status: "ACTIVE" | "INACTIVE";
};

const INITIAL_FORM: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "MODERATOR",
  status: "ACTIVE",
};

const PASSWORD_RULES = {
  minLength: (value: string) => value.length >= 8,
  uppercase: (value: string) => /[A-Z]/.test(value),
  lowercase: (value: string) => /[a-z]/.test(value),
  number: (value: string) => /\d/.test(value),
  special: (value: string) => /[^A-Za-z0-9]/.test(value),
};

function isValidPassword(password: string) {
  return Object.values(PASSWORD_RULES).every((rule) => rule(password));
}

function getErrorMessage(body: unknown, fallback: string) {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body
  ) {
    const message = (body as { message?: unknown }).message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default function UsuariosPage({
  initialUsuarios,
  initialError,
}: {
  initialUsuarios: Usuario[];
  initialError: string | null;
}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<Usuario | null>(
    null,
  );

  const [form, setForm] = useState<UserFormData>(INITIAL_FORM);
  const [editForm, setEditForm] = useState<UserEditData>({
    name: "",
    email: "",
    password: "",
    role: "MODERATOR",
    status: "ACTIVE",
  });

  const [formError, setFormError] = useState<string | null>(null);

  const mainAdminEmail = "angelmp2097@gmail.com";

  async function handleRetry() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/usuarios", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const body = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(body, "No fue posible cargar los usuarios."),
        );
      }

      setUsuarios(Array.isArray(body) ? body : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar los usuarios.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(INITIAL_FORM);
    setFormError(null);
    setIsCreateOpen(true);
  }

  function closeCreate() {
    if (saving) return;

    setIsCreateOpen(false);
    setForm(INITIAL_FORM);
    setFormError(null);
  }

  function openEdit(usuario: Usuario) {
    setEditingUser(usuario);
    setEditForm({
      name: usuario.name,
      email: usuario.email,
      password: "",
      role: usuario.role,
      status: usuario.status,
    });
    setFormError(null);
  }

  function closeEdit() {
    if (saving) return;

    setEditingUser(null);
    setFormError(null);
  }

  function validatePassword(password: string) {
    if (!isValidPassword(password)) {
      setFormError(
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
      );
      return false;
    }

    return true;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validatePassword(form.password)) {
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          status: form.status,
        }),
      });

      const body = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(body, "No fue posible crear el usuario."),
        );
      }

      if (body && typeof body === "object") {
        setUsuarios((current) => [...current, body as Usuario]);
      } else {
        await handleRetry();
      }

      closeCreate();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "No fue posible crear el usuario.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    if (editForm.password && !validatePassword(editForm.password)) {
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload: {
        name: string;
        email: string;
        role: "ADMIN" | "MODERATOR";
        status: "ACTIVE" | "INACTIVE";
        password?: string;
      } = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        status: editForm.status,
      };

      if (editForm.password) {
        payload.password = editForm.password;
      }

      const response = await fetch(`/api/usuarios/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(body, "No fue posible actualizar el usuario."),
        );
      }

      if (body && typeof body === "object") {
        const updatedUser = body as Usuario;

        setUsuarios((current) =>
          current.map((usuario) =>
            usuario.id === updatedUser.id ? updatedUser : usuario,
          ),
        );
      } else {
        await handleRetry();
      }

      closeEdit();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "No fue posible actualizar el usuario.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReactivate(usuario: Usuario) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          status: "ACTIVE",
        }),
      });

      const body = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(body, "No fue posible reactivar el usuario."),
        );
      }

      if (body && typeof body === "object") {
        const updatedUser = body as Usuario;

        setUsuarios((current) =>
          current.map((currentUser) =>
            currentUser.id === updatedUser.id ? updatedUser : currentUser,
          ),
        );
      } else {
        await handleRetry();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible reactivar el usuario.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeactivate() {
    if (!deactivatingUser) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/usuarios/${deactivatingUser.id}/deactivate`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const body = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(body, "No fue posible desactivar el usuario."),
        );
      }

      if (body && typeof body === "object") {
        const updatedUser = body as Usuario;

        setUsuarios((current) =>
          current.map((usuario) =>
            usuario.id === updatedUser.id ? updatedUser : usuario,
          ),
        );
      } else {
        await handleRetry();
      }

      setDeactivatingUser(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible desactivar el usuario.",
      );
    } finally {
      setSaving(false);
    }
  }

  const activeUsers = usuarios.filter(
    (usuario) => usuario.status === "ACTIVE",
  );

  const inactiveUsers = usuarios.filter(
    (usuario) => usuario.status === "INACTIVE",
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Usuarios</h1>
            <p className="mt-1 text-sm text-white/50">
              {activeUsers.length} activos · {inactiveUsers.length} inactivos
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
          >
            Crear usuario
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              disabled={loading}
              className="mt-3 text-sm font-medium text-white underline underline-offset-4 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Reintentar"}
            </button>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr className="text-left text-xs uppercase tracking-wide text-white/40">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {usuarios.map((usuario) => {
                const isMainAdmin =
                  usuario.email.toLowerCase() === mainAdminEmail;

                return (
                  <tr key={usuario.id} className="text-sm text-white/80">
                    <td className="px-4 py-4">{usuario.name}</td>
                    <td className="px-4 py-4">{usuario.email}</td>
                    <td className="px-4 py-4">{usuario.role}</td>
                    <td className="px-4 py-4">
                      {usuario.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(usuario)}
                          className="text-sm text-white/70 transition hover:text-white"
                        >
                          Editar
                        </button>

                        {!isMainAdmin &&
                          (usuario.status === "ACTIVE" ? (
                            <button
                              type="button"
                              onClick={() => setDeactivatingUser(usuario)}
                              disabled={saving}
                              className="text-sm text-red-300 transition hover:text-red-200 disabled:opacity-50"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleReactivate(usuario)}
                              disabled={saving}
                              className="text-sm text-emerald-300 transition hover:text-emerald-200 disabled:opacity-50"
                            >
                              Reactivar
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {usuarios.length === 0 && !loading && (
            <div className="p-8 text-center text-sm text-white/40">
              No hay usuarios registrados.
            </div>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#07191e] p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Crear usuario
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Registra un nuevo usuario para acceder a Clip Manager.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nombre"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />

              <input
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Correo electrónico"
                type="email"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />

              <input
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Contraseña"
                type="password"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />

              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as UserFormData["role"],
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="MODERATOR">Moderador</option>
                <option value="ADMIN">Administrador</option>
              </select>

              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as UserFormData["status"],
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>

              {formError && (
                <p className="text-sm text-red-300">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreate}
                  disabled={saving}
                  className="rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#07191e] p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Editar usuario
              </h2>

              <p className="mt-1 text-sm text-white/50">
                Actualiza los datos del usuario.
              </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nombre"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />

              <input
                value={editForm.email}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Correo electrónico"
                type="email"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />

              <input
                value={editForm.password}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Nueva contraseña (opcional)"
                type="password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />

              <select
                value={editForm.role}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    role: event.target.value as UserEditData["role"],
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="MODERATOR">Moderador</option>
                <option value="ADMIN">Administrador</option>
              </select>

              <select
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    status: event.target.value as UserEditData["status"],
                  }))
                }
                disabled={
                  editingUser.email.toLowerCase() === mainAdminEmail
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>

              {formError && (
                <p className="text-sm text-red-300">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deactivatingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#07191e] p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">
              Desactivar usuario
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/60">
              ¿Seguro que deseas desactivar a{" "}
              <span className="text-white">
                {deactivatingUser.name}
              </span>
              ? El usuario no podrá iniciar sesión mientras permanezca
              inactivo.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeactivatingUser(null)}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm text-white/70 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDeactivate}
                disabled={saving}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Desactivando..." : "Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}