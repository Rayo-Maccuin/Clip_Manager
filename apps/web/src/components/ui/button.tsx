"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClass } from "@/lib/button-class";
export { buttonClass } from "@/lib/button-class";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
};

const iconSizes: Record<ButtonSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[18px] w-[18px]",
};

export function Button({
  variant = "secondary",
  size = "md",
  isLoading = false,
  loadingLabel,
  icon,
  fullWidth = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={buttonClass({ variant, size, fullWidth, className })}
      {...rest}
    >
      {isLoading ? (
        <svg className={`${iconSizes[size]} animate-spin`} viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon
      )}
      {isLoading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
