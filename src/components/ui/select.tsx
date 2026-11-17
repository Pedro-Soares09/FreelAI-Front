"use client";

import type { SelectHTMLAttributes } from "react";
import { Field, classeControle } from "./field";

type Opcao = { valor: string; rotulo: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  opcoes: Opcao[];
  placeholder?: string;
  error?: string;
  hint?: string;
};

export function Select({
  label,
  opcoes,
  placeholder,
  error,
  hint,
  className,
  ...props
}: SelectProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={classeControle(invalid, `h-10 ${className ?? ""}`)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
