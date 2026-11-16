"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  const describedBy = error || hint ? msgId : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {(error || hint) && (
        <p
          id={msgId}
          role={error ? "alert" : undefined}
          className={cn("text-xs", error ? "text-danger" : "text-muted")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function classeControle(invalid: boolean, extra?: string) {
  return cn(
    "w-full rounded-lg border bg-surface-2 px-3 text-fg placeholder:text-muted transition disabled:cursor-not-allowed disabled:opacity-50",
    invalid ? "border-danger" : "border-borda hover:border-primary",
    extra,
  );
}
