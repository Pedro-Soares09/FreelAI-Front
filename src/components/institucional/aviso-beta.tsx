export function AvisoBeta({ className = "" }: { className?: string }) {
  return (
    <p
      role="note"
      className={`rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary ${className}`}
    >
      Versão Beta para demonstração. Os dados e os pagamentos são simulados.
    </p>
  );
}
