export function Spinner({ rotulo = "Carregando" }: { rotulo?: string }) {
  return (
    <span role="status" className="inline-flex items-center">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="sr-only">{rotulo}</span>
    </span>
  );
}
