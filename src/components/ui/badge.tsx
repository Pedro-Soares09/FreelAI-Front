import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tom = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const tons: Record<Tom, string> = {
  neutral: "bg-surface-2 text-muted border-borda",
  primary: "bg-primary/15 text-primary border-primary/40",
  success: "bg-success/15 text-success border-success/40",
  warning: "bg-warning/15 text-warning border-warning/40",
  danger: "bg-danger/15 text-danger border-danger/40",
  info: "bg-info/15 text-info border-info/40",
};

export function Badge({ tom = "neutral", children }: { tom?: Tom; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tons[tom],
      )}
    >
      {children}
    </span>
  );
}
