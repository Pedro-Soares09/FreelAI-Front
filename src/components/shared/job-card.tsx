import { Badge } from './trust-seals';

interface JobCardProps {
  title: string;
  budget: string;
  description: string;
  isPro?: boolean;
  isNew?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ title, budget, description, isPro, isNew }) => {
  return (
    <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex gap-2">
          {isNew && <Badge type="novo" />}
          {isPro && <Badge type="pro" />}
        </div>
      </div>
      <p className="text-sm text-zinc-400 line-clamp-2">{description}</p>
      <div className="flex justify-between items-center mt-2 pt-3 border-t border-zinc-800/60">
        <span className="text-emerald-400 font-bold">{budget}</span>
        <span className="text-xs text-zinc-500">Visualizar Vaga &rarr;</span>
      </div>
    </div>
  );
};
