"use client";

import { SeletorLocal } from "@/components/shared/seletor-local";
import type { Coordenada } from "@/services/geo";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError, mensagemDeErro } from "@/api/erro";
import { CadastroShell } from "@/components/conta/cadastro-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { BAIRROS, cpfValido, mascaraCpf, mascaraTelefone } from "@/lib/bairros";
import { useSessao } from "@/lib/session";
import { freelaiApi, type CategoriaVaga } from "@/services/api";
import { contaApi } from "@/services/conta";

type Etapa = 1 | 2 | 3 | 4;
type Experiencia = { descricao: string; categoria: string };
type Erros = Record<string, string>;

const ROTULO_RISCO = { baixo: "Risco baixo", medio: "Risco médio", alto: "Risco alto" } as const;
const TOM_RISCO = { baixo: "success", medio: "warning", alto: "danger" } as const;
const CHAVE_RASCUNHO = "freelai-cadastro-profissional";
const NOTAS = ["1", "2", "3", "4", "5"].map((n) => ({ valor: n, rotulo: n }));

type Rascunho = {
  etapa: Etapa;
  cpf: string;
  nascimento: string;
  telefone: string;
  bairro: string;
  logradouro: string;
  raio: string;
  categorias: string[];
  comunicacao: string;
  agilidade: string;
  organizacao: string;
  experiencias: Experiencia[];
};

function lerRascunho(): Partial<Rascunho> {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_RASCUNHO) ?? "{}") as Partial<Rascunho>;
  } catch {
    return {};
  }
}

export default function CadastroProfissionalPage() {
  const router = useRouter();
  const { atualizar } = useSessao();
  const { avisar } = useToast();
  const [categoriasApi, setCategoriasApi] = useState<CategoriaVaga[]>([]);
  const [etapa, setEtapa] = useState<Etapa>(1);
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [coords, setCoords] = useState<Coordenada | null>(null);
  const [raio, setRaio] = useState("5");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [comunicacao, setComunicacao] = useState("");
  const [agilidade, setAgilidade] = useState("");
  const [organizacao, setOrganizacao] = useState("");
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [novaExperiencia, setNovaExperiencia] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string>();
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(false);

  // Recarregar a página mantém a etapa e o que já foi preenchido.
  useEffect(() => {
    const r = lerRascunho();
    if (r.etapa) setEtapa(r.etapa);
    if (r.cpf) setCpf(r.cpf);
    if (r.nascimento) setNascimento(r.nascimento);
    if (r.telefone) setTelefone(r.telefone);
    if (r.bairro) setBairro(r.bairro);
    if (r.logradouro) setLogradouro(r.logradouro);
    if (r.raio) setRaio(r.raio);
    if (r.categorias) setCategorias(r.categorias);
    if (r.comunicacao) setComunicacao(r.comunicacao);
    if (r.agilidade) setAgilidade(r.agilidade);
    if (r.organizacao) setOrganizacao(r.organizacao);
    if (r.experiencias) setExperiencias(r.experiencias);
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    const r: Rascunho = {
      etapa, cpf, nascimento, telefone, bairro, logradouro, raio, categorias,
      comunicacao, agilidade, organizacao, experiencias,
    };
    sessionStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(r));
  }, [pronto, etapa, cpf, nascimento, telefone, bairro, logradouro, raio, categorias, comunicacao, agilidade, organizacao, experiencias]);

  useEffect(() => {
    freelaiApi
      .listarCategorias()
      .then(setCategoriasApi)
      .catch(() => avisar("Não foi possível carregar as categorias.", "error"));
  }, [avisar]);

  function validar(passo: Etapa): Erros {
    const e: Erros = {};
    if (passo === 1) {
      if (!cpfValido(cpf)) e.cpf = "Informe um CPF válido.";
      if (!nascimento) e.nascimento = "Informe a data de nascimento.";
      else {
        const hoje = new Date();
        const nasc = new Date(nascimento);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        if (hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) idade -= 1;
        if (idade < 18) e.nascimento = "É necessário ter 18 anos ou mais.";
      }
      const digitos = telefone.replace(/\D/g, "");
      if (digitos.length < 10) e.telefone = "Informe o telefone com DDD.";
    }
    if (passo === 2) {
      if (!bairro) e.bairro = "Escolha o bairro onde você atua.";
      if (!(Number(raio) >= 1)) e.raio = "Informe um raio de pelo menos 1 km.";
    }
    if (passo === 3 && categorias.length === 0) e.categorias = "Escolha pelo menos uma categoria.";
    return e;
  }

  function avancar() {
    const invalidos = validar(etapa);
    setErros(invalidos);
    if (Object.keys(invalidos).length === 0) setEtapa((e) => (e < 4 ? ((e + 1) as Etapa) : e));
  }

  function alternarCategoria(slug: string) {
    setCategorias((atual) => (atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug]));
  }

  function adicionarExperiencia() {
    if (!novaExperiencia.trim()) return;
    setExperiencias((l) => [...l, { descricao: novaExperiencia.trim(), categoria: novaCategoria }]);
    setNovaExperiencia("");
    setNovaCategoria("");
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    for (const passo of [1, 2, 3] as Etapa[]) {
      const invalidos = validar(passo);
      if (Object.keys(invalidos).length > 0) {
        setErros(invalidos);
        setEtapa(passo);
        return;
      }
    }
    const local = BAIRROS.find((b) => b.nome === bairro);
    if (!local) return;
    setEnviando(true);
    setErroGeral(undefined);
    try {
      await contaApi.cadastrarProfissional({
        cpf,
        data_nascimento: nascimento,
        telefone,
        bairro: local.nome,
        logradouro: logradouro.trim() || null,
        latitude: coords?.lat ?? local.latitude,
        longitude: coords?.lng ?? local.longitude,
        raio_km: Number(raio),
        categorias,
        caracteristicas: {
          comunicacao: comunicacao ? Number(comunicacao) : null,
          agilidade: agilidade ? Number(agilidade) : null,
          organizacao: organizacao ? Number(organizacao) : null,
        },
        experiencias: experiencias.map((x) => ({
          descricao: x.descricao,
          categoria: x.categoria || null,
        })),
      });
      sessionStorage.removeItem(CHAVE_RASCUNHO);
      await atualizar();
      avisar("Cadastro enviado. Falta verificar sua identidade.", "success");
      router.replace("/verificacao?origem=cadastro");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.campos).length > 0) setErros(err.campos);
      setErroGeral(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <CadastroShell
      titulo="Cadastro do profissional"
      descricao={`Etapa ${etapa} de 4. Seus dados ficam salvos enquanto você preenche.`}
    >
      <form onSubmit={enviar} noValidate className="grid gap-5">
        {etapa === 1 && (
          <div className="grid gap-4">
            <Input label="CPF" inputMode="numeric" value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} error={erros.cpf} />
            <Input label="Data de nascimento" type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} error={erros.nascimento} />
            <Input label="Telefone com DDD" inputMode="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} error={erros.telefone} hint="O telefone não aparece para os contratantes." />
          </div>
        )}

        {etapa === 2 && (
          <div className="grid gap-4">
            <Select label="Bairro" value={bairro} onChange={(e) => { setBairro(e.target.value); setCoords(null); }} placeholder="Selecione" opcoes={BAIRROS.map((b) => ({ valor: b.nome, rotulo: b.nome }))} error={erros.bairro} />
            <Input label="Rua e número (opcional)" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
            <SeletorLocal bairro={bairro} coords={coords} onChange={(m) => { setCoords(m.coords); if (m.bairro) setBairro(m.bairro); if (m.logradouro) setLogradouro(m.logradouro); }} />
            <Input label="Raio de atuação (km)" type="number" min="1" max="15" value={raio} onChange={(e) => setRaio(e.target.value)} error={erros.raio} hint="Você recebe convites de vagas dentro deste raio, até 15 km." />
          </div>
        )}

        {etapa === 3 && (
          <div className="grid gap-4">
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-semibold">Categorias em que você atua</legend>
              {categoriasApi.map((c) => (
                <label key={c.slug} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-borda px-3 py-2">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={categorias.includes(c.slug)} onChange={() => alternarCategoria(c.slug)} />
                    {c.nome}
                  </span>
                  <Badge tom={TOM_RISCO[c.nivel_risco]}>{ROTULO_RISCO[c.nivel_risco]}</Badge>
                </label>
              ))}
              {erros.categorias && <p role="alert" className="text-sm text-danger">{erros.categorias}</p>}
              <p className="text-xs text-muted">Categorias de risco médio ou alto exigem experiência, e algumas exigem qualificação e EPI, aprovados pela administração.</p>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Comunicação" value={comunicacao} onChange={(e) => setComunicacao(e.target.value)} placeholder="1 a 5" opcoes={NOTAS} />
              <Select label="Agilidade" value={agilidade} onChange={(e) => setAgilidade(e.target.value)} placeholder="1 a 5" opcoes={NOTAS} />
              <Select label="Organização" value={organizacao} onChange={(e) => setOrganizacao(e.target.value)} placeholder="1 a 5" opcoes={NOTAS} />
            </div>
            <p className="text-xs text-muted">Características autodeclaradas: informação complementar, sem peso no match.</p>
          </div>
        )}

        {etapa === 4 && (
          <div className="grid gap-4">
            <div>
              <h2 className="text-base font-semibold">Experiências</h2>
              <p className="text-sm text-muted">Conte o que você já fez. A administração aprova antes de liberar categorias de risco.</p>
            </div>
            <ul className="grid gap-2">
              {experiencias.map((x, i) => (
                <li key={`${x.descricao}-${i}`} className="flex items-start justify-between gap-3 rounded-lg border border-borda px-3 py-2 text-sm">
                  <span>{x.descricao}{x.categoria ? ` (${categoriasApi.find((c) => c.slug === x.categoria)?.nome ?? x.categoria})` : ""}</span>
                  <button type="button" className="text-danger" onClick={() => setExperiencias((l) => l.filter((_, j) => j !== i))}>Remover</button>
                </li>
              ))}
            </ul>
            <Textarea label="Nova experiência" value={novaExperiencia} onChange={(e) => setNovaExperiencia(e.target.value)} rows={3} />
            <Select label="Categoria (opcional)" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} placeholder="Qualquer" opcoes={categoriasApi.filter((c) => categorias.includes(c.slug)).map((c) => ({ valor: c.slug, rotulo: c.nome }))} />
            <div>
              <Button type="button" variant="secondary" onClick={adicionarExperiencia}>Adicionar experiência</Button>
            </div>
            <div className="rounded-lg border border-borda bg-surface-2 p-3 text-sm">
              <strong>Resumo:</strong> {bairro}, raio de {raio} km, {categorias.length} categoria(s), {experiencias.length} experiência(s).
            </div>
          </div>
        )}

        {erroGeral && <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{erroGeral}</p>}

        <div className="flex justify-between gap-3">
          <Button type="button" variant="secondary" disabled={etapa === 1} onClick={() => setEtapa((e) => (e > 1 ? ((e - 1) as Etapa) : e))}>
            Voltar
          </Button>
          {etapa < 4 ? (
            <Button key="continuar" type="button" onClick={avancar}>Continuar</Button>
          ) : (
            <Button key="enviar" type="submit" loading={enviando}>Enviar cadastro</Button>
          )}
        </div>
      </form>
    </CadastroShell>
  );
}
