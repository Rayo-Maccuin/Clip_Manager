export type ToastKind = "success" | "error";

export function notifyToast(message: string, kind: ToastKind = "success") {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("clip-manager:toast", { detail: { message, kind } }),
  );
}