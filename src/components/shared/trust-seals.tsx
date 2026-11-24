export const Badge = ({ type }: { type: 'novo' | 'pro' | 'estado' }) => {
  const styles = {
    novo: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    pro: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    estado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  const labels = {
    novo: 'Novo',
    pro: 'PRO',
    estado: 'Ativo'
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${styles[type]}`}>
      {labels[type]}
    </span>
  );
};
