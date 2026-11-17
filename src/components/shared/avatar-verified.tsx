import React from "react";
import type { VerificationStatus } from "@/types";

type AvatarVerifiedProps = {
  name: string;
  imageUrl?: string;
  verified?: boolean;
  status?: VerificationStatus;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
};

export function AvatarVerified({
  name,
  imageUrl,
  verified = false,
  status,
  size = "md",
  showLabel = false,
}: AvatarVerifiedProps) {
  const isVerified = verified || status === "verificado";
  const isPending = status === "em_analise";
  const isRejected = status === "recusado";

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  }[size];

  const badgeSizeClasses = {
    sm: "w-3.5 h-3.5 text-[9px] -bottom-0.5 -right-0.5",
    md: "w-4 h-4 text-[10px] -bottom-0.5 -right-0.5",
    lg: "w-6 h-6 text-xs bottom-0 right-0",
    xl: "w-8 h-8 text-sm bottom-0.5 right-0.5",
  }[size];

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative inline-block">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`Foto de perfil de ${name}`}
            className={`${sizeClasses} rounded-full object-cover border-2 border-white shadow-sm`}
          />
        ) : (
          <div
            className={`${sizeClasses} rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center border-2 border-white shadow-sm`}
            aria-hidden="true"
          >
            {name.trim() ? name.trim().slice(0, 1).toUpperCase() : "U"}
          </div>
        )}

        {isVerified && (
          <span
            className={`absolute ${badgeSizeClasses} rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-white`}
            title="Perfil Verificado com Identidade Validada"
            aria-label="Perfil verificado"
          >
            ✓
          </span>
        )}

        {isPending && (
          <span
            className={`absolute ${badgeSizeClasses} rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-white`}
            title="Verificação em análise"
            aria-label="Verificação em análise"
          >
            ⏳
          </span>
        )}

        {isRejected && (
          <span
            className={`absolute ${badgeSizeClasses} rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-white`}
            title="Verificação recusada"
            aria-label="Verificação recusada"
          >
            ✕
          </span>
        )}
      </div>

      {showLabel && (
        <span className="font-medium text-slate-800 text-sm">{name}</span>
      )}
    </div>
  );
}
