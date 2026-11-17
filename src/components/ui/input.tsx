"use client";

import type { InputHTMLAttributes } from "react";
import { Field, classeControle } from "./field";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, className, ...props }: InputProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={classeControle(invalid, `h-10 ${className ?? ""}`)}
          {...props}
        />
      )}
    </Field>
  );
}
