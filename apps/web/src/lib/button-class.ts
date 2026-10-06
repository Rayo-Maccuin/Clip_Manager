export const variantClasses = {
  primary:
    "border-[#F01B25] bg-[#E50914] text-white shadow-[0_6px_20px_rgba(229,9,20,0.22)] hover:border-[#FF3943] hover:bg-[#FF1F2D] hover:shadow-[0_10px_30px_rgba(229,9,20,0.3)] active:border-[#B20710] active:bg-[#B20710]",
  secondary:
    "border-[#303030] bg-[#151515] text-[#D4D4D4] hover:border-[#3D3D3D] hover:bg-[#202020] hover:text-white active:bg-[#111111]",
  ghost:
    "border-transparent bg-transparent text-[#A3A3A3] hover:bg-[#151515] hover:text-white active:bg-[#111111]",
  danger:
    "border-[#7F1D1D] bg-[#EF4444]/10 text-[#F87171] hover:border-[#EF4444]/50 hover:bg-[#EF4444]/20 hover:text-[#FCA5A5] active:bg-[#EF4444]/25",
} as const;

export const sizeClasses = {
  sm: "min-h-[30px] gap-1.5 px-2.5 text-[11px]",
  md: "min-h-[38px] gap-2 px-4 text-xs",
  lg: "min-h-[46px] gap-2.5 px-6 text-sm",
} as const;

export function buttonClass({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return `cm-btn ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`.trim();
}
