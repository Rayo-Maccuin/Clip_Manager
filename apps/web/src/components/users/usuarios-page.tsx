"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Modal } from "@/components/ui/modal";
import { PasswordInput } from "@/components/ui/password-input";
import { ToneBadge } from "@/components/ui/status-badge";
import { notifyToast } from "@/lib/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export type Usuario = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MODERATOR";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

const passwordRequirements = [
  { label: 'Mínimo 8 caracteres', matches: (value: string) => value.length >= 8 },
  { label: 'Una mayúscula', matches: (value: string) => /[A-Z]/.test(value) },
  { label: 'Una minúscula', matches: (value: string) => /[a-z]/.test(value) },
  { label: 'Un número', matches: (value: string) => /\d/.test(value) },
  {
    label: 'Un carácter especial',
    matches: (value: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value),
  },
];

type UsuariosPageProps = {
  initialUsuarios: Usuario[];
  initialError: string | null;
};

export default function UsuariosPage({ initialUsuarios, initialError }: UsuariosPageProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [error, setError] = useState<string | null>(initialError);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "MODERATOR">("MODERATOR");
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [createError, setCreateError] = useState<string | null>(null);

  const [userBeingEdited, setUserBeingEdited] = useState<Usuario | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"ADMIN" | "MODERATOR">("MODERATOR");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirmation, setEditPasswordConfirmation] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [userToDeactivate, setUserToDeactivate] = useState<Usuario | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  async function handleRetry() {
    setIsRetrying(true);
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error();
      setUsuarios((await response.json()) as Usuario[]);
      setError(null);
    } catch {
      setError("No fue posible cargar los usuarios. Intenta nuevamente.");
    } finally {
      setIsRetrying(false);
    }
  }

  function resetCreateForm() {
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setNewRole("MODERATOR");
    setNewStatus("ACTIVE");
    setCreateError(null);
  }

  function openCreateModal() {
    setUserBeingEdited(null);
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    resetCreateForm();
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (isCreating) return;

    const cleanName = newName.trim();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !newPassword) {
      setCreateError("Completa todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setCreateError("Las contraseñas no coinciden.");
      return;
    }

    if (passwordRequirements.some((requirement) => !requirement.matches(newPassword))) {
      setCreateError("La contraseña todavía no cumple todos los requisitos.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: newPassword,
          role: newRole,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message
            ? Array.isArray(errorData.message)
              ? errorData.message.join(", ")
              : errorData.message
            : "No fue posible crear el usuario.",
        );
      }

      const created = (await response.json()) as Usuario;
      setUsuarios((current) => [created, ...current]);
      notifyToast("Usuario creado correctamente.");
      closeCreateModal();
    } catch (caughtError) {
      setCreateError(
        caughtError instanceof Error ? caughtError.message : "No fue posible crear el usuario.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  function openEditModal(user: Usuario) {
    setUserBeingEdited(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword("");
    setEditPasswordConfirmation("");
    setEditError(null);
  }

  function closeEditModal() {
    if (isUpdating) return;
    setUserBeingEdited(null);
    setEditError(null);
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!userBeingEdited || isUpdating) return;

    if (editPassword !== editPasswordConfirmation) {
      setEditError("Las contraseñas no coinciden.");
      return;
    }

    if (editPassword && passwordRequirements.some((requirement) => !requirement.matches(editPassword))) {
      setEditError("La nueva contraseña todavía no cumple todos los requisitos.");
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    try {
      const payload: Record<string, string> = {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        role: editRole,
        status: editStatus,
      };
      if (editPassword) payload.password = editPassword;

      const response = await fetch(`${API_URL}/usuarios/${userBeingEdited.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message
            ? Array.isArray(errorData.message)
              ? errorData.message.join(", ")
              : errorData.message
            : "No fue posible actualizar el usuario.",
        );
      }

      const updated = (await response.json()) as Usuario;
      setUsuarios((current) => current.map((user) => user.id === updated.id ? updated : user));
      notifyToast("Usuario actualizado correctamente.");
      setUserBeingEdited(null);
    } catch (caughtError) {
      setEditError(caughtError instanceof Error ? caughtError.message : "No fue posible actualizar el usuario.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleReactivate(user: Usuario) {
    try {
      const response = await fetch(`${API_URL}/usuarios/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      if (!response.ok) throw new Error("No fue posible activar el usuario.");
      const updated = (await response.json()) as Usuario;
      setUsuarios((current) => current.map((item) => item.id === updated.id ? updated : item));
      notifyToast("Usuario activado correctamente.");
    } catch {
      setError("No fue posible activar el usuario. Intenta de nuevo.");
    }
  }

  function handleDeactivate(user: Usuario) {
    setUserToDeactivate(user);
  }

  async function confirmDeactivate() {
    if (!userToDeactivate || isDeactivating) return;

    setIsDeactivating(true);

    try {
      const response = await fetch(`${API_URL}/usuarios/${userToDeactivate.id}/deactivate`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No fue posible desactivar el usuario.");
      }

      setUsuarios((current) =>
        current.map((u) =>
          u.id === userToDeactivate.id ? { ...u, status: "INACTIVE" as const } : u,
        ),
      );
      notifyToast("Usuario desactivado correctamente.");
    } catch {
      setError("No fue posible desactivar el usuario. Intenta de nuevo.");
    } finally {
      setIsDeactivating(false);
      setUserToDeactivate(null);
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="rounded-xl border border-[#242424] bg-[#0D0D0D] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#737373]">
              Administración de cuentas
            </p>
            <p className="mt-1 text-xs text-[#A3A3A3]">
              {usuarios.length} {usuarios.length === 1 ? "usuario registrado" : "usuarios registrados"}
            </p>
          </div>
          <Button variant="primary" onClick={() => openCreateModal()}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo usuario</span>
          </Button>
        </div>

        {error && (
          <p
            className="cm-field__error mt-4"
            role="alert"
          >
            {error}
            <button type="button" onClick={() => void handleRetry()} disabled={isRetrying} className="ml-2 underline underline-offset-2 disabled:opacity-50">
              {isRetrying ? "Reintentando..." : "Reintentar"}
            </button>
          </p>
        )}
      </div>

      {usuarios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#242424] bg-[#0D0D0D] p-12 text-center">
          <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl border border-[#242424] bg-[#111111] text-[#525252]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9V6a3 3 0 00-3-3H9a3 3 0 00-3 3v3m6 0h6m-6 0l2 2m-2-2l-2 2" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-[#D4D4D4]">Todavía no hay usuarios</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-[#737373]">
            Crea la primera cuenta para dar acceso al equipo de moderación.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#242424] bg-[#0D0D0D]">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b border-[#242424]">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  Nombre
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  Email
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  Rol
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  Estado
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  Creado
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id} className="border-b border-[#1A1A1A] transition-colors last:border-0 hover:bg-[#111111]">
                  <td className="px-4 py-3 text-sm font-semibold text-[#F5F5F5]">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#737373]">
                    {user.email}
                  </td>                  <td className="px-4 py-3">
                    <ToneBadge tone={user.role === "ADMIN" ? "primary" : "success"} dot>
                      {user.role === "ADMIN" ? "Administrador" : "Moderador"}
                    </ToneBadge>
                  </td>
                  <td className="px-4 py-3">
                    <ToneBadge tone={user.status === "ACTIVE" ? "success" : "muted"} dot>
                      {user.status === "ACTIVE" ? "Activo" : "Inactivo"}
                    </ToneBadge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#737373]">
                    {new Date(user.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                        Editar
                      </Button>
                      {user.status === "ACTIVE" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(user)}
                          disabled={user.email === "angelmp2097@gmail.com"}
                          title={user.email === "angelmp2097@gmail.com" ? "No se puede desactivar al administrador principal" : "Desactivar usuario"}
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => void handleReactivate(user)}>
                          Activar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <Modal isOpen onClose={closeCreateModal} labelledBy="create-user-title">
          <header className="cm-modal__header">
            <div>
              <p className="cm-modal__eyebrow">Administración de cuentas</p>
              <h2 id="create-user-title" className="cm-modal__title">
                Crear nuevo usuario
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={isCreating}
              aria-label="Cerrar"
              className="cm-modal__close"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <form onSubmit={(e) => void handleCreate(e)} className="mt-5 space-y-4">
            <div className="cm-field">
              <label htmlFor="new-user-name" className="cm-field__label">
                Nombre
              </label>
              <input
                id="new-user-name"
                type="text"
                required
                maxLength={100}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isCreating}
                className="cm-input"
                placeholder="Ej. Ana Gómez"
                autoFocus
              />
            </div>

            <div className="cm-field">
              <label htmlFor="new-user-email" className="cm-field__label">
                Email
              </label>
              <input
                id="new-user-email"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isCreating}
                className="cm-input"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <div className="cm-field">
              <label htmlFor="new-user-password" className="cm-field__label">
                Contraseña
              </label>
              <PasswordInput
                id="new-user-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isCreating}
                placeholder="Mínimo 8 caracteres, mayúscula, minúscula, número y especial"
              />
              <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                {passwordRequirements.map((requirement) => {
                  const valid = requirement.matches(newPassword);
                  return (
                    <li key={requirement.label} className={`text-[10px] ${valid ? "text-[#22C55E]" : "text-[#737373]"}`}>
                      {valid ? "✓" : "○"} {requirement.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="cm-field">
              <label htmlFor="new-user-password-confirm" className="cm-field__label">
                Confirmar contraseña
              </label>
              <PasswordInput
                id="new-user-password-confirm"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="cm-field">
                <span className="cm-field__label">Rol</span>
                <DropdownSelect
                  label="Rol del nuevo usuario"
                  value={newRole}
                  onChange={(value) => setNewRole(value as "ADMIN" | "MODERATOR")}
                  disabled={isCreating}
                  options={[
                    { value: "MODERATOR", label: "Moderador" },
                    { value: "ADMIN", label: "Administrador" },
                  ]}
                  compact
                />
              </div>
              <div className="cm-field">
                <span className="cm-field__label">Estado</span>
                <DropdownSelect
                  label="Estado del nuevo usuario"
                  value={newStatus}
                  onChange={(value) => setNewStatus(value as "ACTIVE" | "INACTIVE")}
                  disabled={isCreating}
                  options={[
                    { value: "ACTIVE", label: "Activo" },
                    { value: "INACTIVE", label: "Inactivo" },
                  ]}
                  compact
                />
              </div>
            </div>

            {createError && (
              <p role="alert" className="cm-field__error">
                {createError}
              </p>
            )}

            <footer className="cm-modal__footer">
              <Button variant="ghost" onClick={closeCreateModal} disabled={isCreating}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isCreating}
                loadingLabel="Creando..."
                disabled={!newName.trim() || !newEmail.trim() || !newPassword.trim()}
              >
                Crear usuario
              </Button>
            </footer>
          </form>
        </Modal>
      )}

      {userBeingEdited && (
        <Modal isOpen onClose={closeEditModal} labelledBy="edit-user-title">
          <form onSubmit={(event) => void handleUpdate(event)}>
            <header className="cm-modal__header">
              <div className="min-w-0">
                <p className="cm-modal__eyebrow">Administración de cuentas</p>
                <h2 id="edit-user-title" className="cm-modal__title">
                  Editar usuario
                </h2>
              </div>
              <button type="button" onClick={closeEditModal} disabled={isUpdating} aria-label="Cerrar" className="cm-modal__close">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="mt-5 space-y-4">
              <div className="cm-field">
                <label htmlFor="edit-user-name" className="cm-field__label">Nombre</label>
                <input id="edit-user-name" required maxLength={100} value={editName} onChange={(event) => setEditName(event.target.value)} disabled={isUpdating} className="cm-input" />
              </div>
              <div className="cm-field">
                <label htmlFor="edit-user-email" className="cm-field__label">Correo</label>
                <input id="edit-user-email" required type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} disabled={isUpdating} className="cm-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="cm-field">
                  <span className="cm-field__label">Rol</span>
                  <DropdownSelect
                    label="Rol"
                    value={editRole}
                    onChange={(value) => setEditRole(value as "ADMIN" | "MODERATOR")}
                    disabled={isUpdating}
                    options={[{ value: "ADMIN", label: "Administrador" }, { value: "MODERATOR", label: "Moderador" }]}
                    compact
                  />
                </div>
                <div className="cm-field">
                  <span className="cm-field__label">Estado</span>
                  <DropdownSelect
                    label="Estado"
                    value={editStatus}
                    onChange={(value) => setEditStatus(value as "ACTIVE" | "INACTIVE")}
                    disabled={isUpdating || userBeingEdited.email === "angelmp2097@gmail.com"}
                    options={[{ value: "ACTIVE", label: "Activo" }, { value: "INACTIVE", label: "Inactivo" }]}
                    compact
                  />
                </div>
              </div>

              <div className="border-t border-[#242424] pt-4">
                <p className="text-xs font-medium text-[#F5F5F5]">Cambiar contraseña</p>
                <p className="mt-1 text-[11px] text-[#737373]">Déjala vacía para conservar la contraseña actual.</p>
                <div className="mt-3 space-y-2">
                  <PasswordInput
                    aria-label="Nueva contraseña"
                    value={editPassword}
                    onChange={(event) => setEditPassword(event.target.value)}
                    disabled={isUpdating}
                    placeholder="Nueva contraseña"
                  />
                  <PasswordInput
                    aria-label="Confirmar nueva contraseña"
                    value={editPasswordConfirmation}
                    onChange={(event) => setEditPasswordConfirmation(event.target.value)}
                    disabled={isUpdating}
                    placeholder="Confirmar nueva contraseña"
                  />
                </div>
                {editPassword && (
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                    {passwordRequirements.map((requirement) => (
                      <li key={requirement.label} className={`text-[10px] ${requirement.matches(editPassword) ? "text-[#22C55E]" : "text-[#737373]"}`}>
                        {requirement.matches(editPassword) ? "✓" : "○"} {requirement.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {editError && <p role="alert" className="cm-field__error">{editError}</p>}
            </div>

            <footer className="cm-modal__footer mt-5">
              <Button variant="ghost" onClick={closeEditModal} disabled={isUpdating}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isUpdating} loadingLabel="Guardando...">
                Guardar cambios
              </Button>
            </footer>
          </form>
        </Modal>
      )}

      <ConfirmationModal
        isOpen={userToDeactivate !== null}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={() => confirmDeactivate()}
        title="Desactivar usuario"
        message={`¿Estás seguro de desactivar a "${userToDeactivate?.name}" (${userToDeactivate?.email})? El usuario no podrá iniciar sesión hasta que sea reactivado.`}
        confirmLabel="Desactivar"
        isConfirming={isDeactivating}
        destructive
      />
    </div>
  );
}
