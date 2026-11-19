import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

type Variante = "primary" | "secondary" | "ghost" | "danger";
type Tamanho = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variante;
  size?: Tamanho;
  loading?: boolean;
};

export const variantesBotao: Record<Variante, string> = {
  primary: "bg-primary text-primary-fg hover:shadow-neon",
  secondary: "border border-borda bg-surface-2 text-fg hover:border-primary",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-danger text-bg hover:opacity-90",
};

export const tamanhosBotao: Record<Tamanho, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const baseBotao =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(baseBotao, variantesBotao[variant], tamanhosBotao[size], className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
