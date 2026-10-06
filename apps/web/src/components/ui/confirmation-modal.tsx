"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  destructive?: boolean;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isConfirming = false,
  destructive = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="confirmation-title" size="sm">
      <header className="cm-modal__header">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-2.5 w-2.5 place-items-center rounded-full ${
              destructive ? "bg-[#E50914]" : "bg-[#F59E0B]"
            }`}
          >
            <span className="h-1 w-1 rounded-full bg-white" />
          </span>
          <h2 id="confirmation-title" className="cm-modal__title">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isConfirming}
          aria-label="Cerrar"
          className="cm-modal__close"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="mt-4 text-xs leading-relaxed text-[#D4D4D4]">{message}</div>

      <footer className="cm-modal__footer">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          disabled={isConfirming}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "danger" : "primary"}
          size="md"
          onClick={() => void onConfirm()}
          disabled={isConfirming}
          isLoading={isConfirming}
          loadingLabel="Procesando..."
        >
          {confirmLabel}
        </Button>
      </footer>
    </Modal>
  );
}
