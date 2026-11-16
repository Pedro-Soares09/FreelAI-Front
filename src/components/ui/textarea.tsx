"use client";

import type { TextareaHTMLAttributes } from "react";
import { Field, classeControle } from "./field";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, className, ...props }: TextareaProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={classeControle(invalid, `min-h-24 py-2 ${className ?? ""}`)}
          {...props}
        />
      )}
    </Field>
  );
}
