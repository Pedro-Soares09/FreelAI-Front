"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/api/erro";
import { Pagina } from "@/components/layout/pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carregando, ErroComRetry } from "@/components/ui/estados";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { mascaraTelefone } from "@/lib/bairros";
import { useSessao } from "@/lib/session";
import { PerfilContratanteEditavel } from "@/components/contratante/perfil-editavel";
import { contratanteApi, type PerfilContratanteDetalhe } from "@/services/contratante";
import { contaApi, type Comprovacao, type PerfilProfissional } from "@/services/conta";

const ROTULO_VERIFICACAO = {
  pendente: "Verificação pendente",
  em_analise: "Em análise",
  verificado: "Verificado",
  recusado: "Verificação recusada",
} as const;
const TOM_VERIFICACAO = { pendente: "warning", em_analise: "info", verificado: "success", recusado: "danger" } as const;
const TOM_STATUS = { pendente: "warning", aprovado: "success", recusado: "danger" } as const;
const ROTULO_PENDENCIA = { experiencia: "experiência", qualificacao: "qualificação", epi: "EPI" } as const;
const ROTULO_COMPROVACAO = { experiencia: "Experiência", qualificacao: "Qualificação", epi: "EPI" } as const;

function VisaoProfissional({ inicial, recarregar }: { inicial: PerfilProfissional; recarregar: () => void }) {
  const { avisar } = useToast();
  const [telefone, setTelefone] = useState(mascaraTelefone(inicial.telefone));
  const [raio, setRaio] = useState(String(inicial.raio_km));
  const [salvando, setSalvando] = useState(false);
  const [comprovacoes, setComprovacoes] = useState<Comprovacao[]>([]);
  const [tipo, setTipo] = useState<"experiencia" | "qualificacao" | "epi">("experiencia");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  const carregarComprovacoes = useCallback(async () => {
    try {
      setComprovacoes(await contaApi.listarComprovacoes());
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    }
  }, [avisar]);

  useEffect(() => {
    void carregarComprovacoes();
  }, [carregarComprovacoes]);

  async function salvar(ev: FormEvent) {
    ev.preventDefault();
    setSalvando(true);
    try {
      await contaApi.atualizarPerfilProfissional({ telefone, raio_km: Number(raio) });
      avisar("Perfil atualizado.", "success");
      recarregar();
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setSalvando(false);
    }
  }

  async function enviarComprovacao(ev: FormEvent) {
    ev.preventDefault();
    if (tipo !== "experiencia" && !categoria) {
      avisar("Escolha a categoria.", "error");
      return;
    }
    if (tipo === "experiencia" && !descricao.trim()) {
      avisar("Descreva a experiência.", "error");
      return;
    }
    if (tipo === "epi" && !arquivo) {
      avisar("Envie a foto do EPI.", "error");
      return;
    }
    setEnviando(true);
    try {
      let url: string | null = null;
      if (arquivo) url = (await contaApi.enviarArquivo(tipo === "epi" ? "epi" : "qualificacao", arquivo)).url;
      if (tipo === "experiencia") {
        await contaApi.enviarExperiencia({ descricao: descricao.trim(), categoria: categoria || null, arquivo_url: url });
      } else if (tipo === "qualificacao") {
        await contaApi.enviarQualificacao({ categoria, tipo: arquivo ? "certificado" : "declaracao", arquivo_url: url, referencia: descricao.trim() || null });
      } else {
        await contaApi.enviarEpi({ categoria, arquivo_url: url ?? "" });
      }
      setDescricao("");
      setArquivo(null);
      avisar("Enviado para análise.", "success");
      await carregarComprovacoes();
      recarregar();
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setEnviando(false);
    }
  }

  const nomeCategoria = (slug: string | null | undefined) => inicial.categorias.find((c) => c.slug === slug)?.nome ?? slug ?? "";

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{inicial.nome}</h2>
          <div className="flex gap-2">
            <Badge tom={TOM_VERIFICACAO[inicial.verificacao]}>{ROTULO_VERIFICACAO[inicial.verificacao]}</Badge>
            {inicial.pro && <Badge tom="primary">Pro</Badge>}
          </div>
        </div>
        {inicial.verificacao !== "verificado" && (
          <p className="mt-3 text-sm">
            {inicial.verificacao === "recusado" && inicial.verificacao_motivo ? `Motivo da recusa: ${inicial.verificacao_motivo}. ` : ""}
            <Link href="/verificacao" className="font-semibold text-primary hover:underline">Abrir verificação de identidade</Link>
          </p>
        )}
        <form onSubmit={salvar} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Telefone com DDD" inputMode="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} />
          <Input label="Raio de atuação (km)" type="number" min="1" max="15" value={raio} onChange={(e) => setRaio(e.target.value)} />
          <p className="text-sm text-muted sm:col-span-2">Bairro: {inicial.bairro ?? "não informado"}. CPF: {inicial.cpf}.</p>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" loading={salvando}>Salvar</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Categorias</h2>
        <ul className="mt-3 grid gap-2">
          {inicial.categorias.map((c) => (
            <li key={c.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borda px-3 py-2 text-sm">
              <span>{c.nome}</span>
              {c.pendencias.length === 0 ? (
                <Badge tom="success">Liberada</Badge>
              ) : (
                <Badge tom="warning">Falta: {c.pendencias.map((p) => ROTULO_PENDENCIA[p]).join(", ")}</Badge>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Comprovações</h2>
        {comprovacoes.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nenhuma comprovação enviada.</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {comprovacoes.map((c) => (
              <li key={`${c.tipo}-${c.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borda px-3 py-2 text-sm">
                <span>
                  {ROTULO_COMPROVACAO[c.tipo]}
                  {c.categoria ? ` · ${nomeCategoria(c.categoria)}` : ""}
                  {c.descricao ? ` · ${c.descricao}` : ""}
                  {c.status === "recusado" && c.motivo_recusa ? ` (motivo: ${c.motivo_recusa})` : ""}
                </span>
                <Badge tom={TOM_STATUS[c.status]}>{c.status}</Badge>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={enviarComprovacao} className="mt-5 grid gap-4 border-t border-borda pt-5">
          <h3 className="text-base font-semibold">Enviar comprovação</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as typeof tipo)}
              opcoes={[
                { valor: "experiencia", rotulo: "Experiência" },
                { valor: "qualificacao", rotulo: "Qualificação" },
                { valor: "epi", rotulo: "EPI" },
              ]}
            />
            <Select label="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder={tipo === "experiencia" ? "Qualquer" : "Selecione"} opcoes={inicial.categorias.map((c) => ({ valor: c.slug, rotulo: c.nome }))} />
          </div>
          {tipo !== "epi" && <Textarea label={tipo === "experiencia" ? "Descrição da experiência" : "Referência (opcional)"} value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />}
          {tipo !== "experiencia" && (
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">{tipo === "epi" ? "Foto do EPI" : "Certificado (opcional)"}</span>
              <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
            </label>
          )}
          <div className="flex justify-end">
            <Button type="submit" loading={enviando}>Enviar para análise</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function PerfilPage() {
  const { usuario } = useSessao();
  const [profissional, setProfissional] = useState<PerfilProfissional | null>(null);
  const [contratante, setContratante] = useState<PerfilContratanteDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!usuario) return;
    try {
      if (usuario.perfil_ativo === "contratante") setContratante(await contratanteApi.obterMeu());
      else if (usuario.perfil_ativo === "profissional") setProfissional(await contaApi.obterPerfilProfissional());
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <Pagina titulo="Meu perfil" descricao="Seus dados, categorias e comprovações.">
      {carregando ? (
        <Carregando />
      ) : erro ? (
        <ErroComRetry mensagem={erro} onTentarNovamente={() => void carregar()} />
      ) : usuario?.perfil_ativo === "contratante" && contratante ? (
        <PerfilContratanteEditavel perfil={contratante} usuarioId={contratante.usuario_id} recarregar={() => void carregar()} />
      ) : profissional ? (
        <VisaoProfissional inicial={profissional} recarregar={() => void carregar()} />
      ) : (
        <p className="text-sm text-muted">Esta conta ainda não tem um perfil ativo cadastrado.</p>
      )}
    </Pagina>
  );
}
