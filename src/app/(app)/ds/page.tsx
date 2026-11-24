'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JobCard } from '@/components/shared/job-card';
import { Badge } from '@/components/shared/trust-seals';

export default function DesignSystemPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 text-zinc-100">
      <div>
        <h1 className="text-3xl font-bold">Design System - FreelAI</h1>
        <p className="text-zinc-400">Vitrine de componentes base da E0 Fundação (Sprint 1).</p>
      </div>

      <section className="flex flex-col gap-4 p-6 bg-zinc-950 rounded-xl border border-zinc-800">
        <h2 className="text-xl font-semibold text-emerald-400">1. Botões & Estados</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Default</Button>
          <Button variant="primary" isLoading>Carregando</Button>
          <Button variant="primary" disabled>Desativado</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4 p-6 bg-zinc-950 rounded-xl border border-zinc-800">
        <h2 className="text-xl font-semibold text-emerald-400">2. Entradas de Formulário (Inputs)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="E-mail profissional" placeholder="kauan@freelai.com" />
          <Input label="Campo com Erro" placeholder="Digite algo..." error="Este campo é obrigatório" />
        </div>
      </section>

      <section className="flex flex-col gap-4 p-6 bg-zinc-950 rounded-xl border border-zinc-800">
        <h2 className="text-xl font-semibold text-emerald-400">3. Selos, Badges & Cards</h2>
        <div className="flex gap-3 mb-2">
          <Badge type="novo" />
          <Badge type="pro" />
          <Badge type="estado" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <JobCard 
            title="Desenvolvedor Front-end React / Next.js" 
            budget="R$ 3.500" 
            description="Procuramos desenvolvedor especialista em Tailwind e componentes modulares para dashboard." 
            isNew 
            isPro 
          />
        </div>
      </section>
    </div>
  );
}
