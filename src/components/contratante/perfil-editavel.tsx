"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/api/erro";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SeloDestaque } from "@/components/ui/selos";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { BAIRROS } from "@/lib/bairros";
import { CORES_PERFIL, TONS, corValida, estiloDaCor, type CorPerfil } from "@/lib/cores-perfil";
import { contratanteApi, type PerfilContratanteDetalhe } from "@/services/contratante";
import { freelaiApi, type CategoriaVaga } from "@/services/api";

const ROTULO_VERIFICACAO = {
  pendente: "Verificação pendente",
  em_analise: "Em análise",
  verificado: "Verificado",
  recusado: "Verificação recusada",
} as const;
const TOM_VERIFICACAO = { pendente: "warning", em_analise: "info", verificado: "success", recusado: "danger" } as const;

const HORARIOS = [
  "Qualquer horário",
  "Manhã (8h às 12h)",
  "Tarde (12h às 18h)",
  "Noite (18h às 21h)",
  "Seg a sex, 18h às 21h",
  "Fins de semana",
];
const TAMANHO_AVATAR = 2 * 1024 * 1024;
const LIMITE_BIO = 300;

type Props = { perfil: PerfilContratanteDetalhe; usuarioId: number; recarregar: () => void };

export function PerfilContratanteEditavel({ perfil, usuarioId, recarregar }: Props) {
  const { avisar } = useToast();
  const entrada = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState(perfil.bio ?? "");
  const [bairro, setBairro] = useState(perfil.bairro ?? "");
  const [horario, setHorario] = useState(perfil.horario_contato ?? "");
  const [categorias, setCategorias] = useState<string[]>(perfil.categorias_interesse ?? []);
  const [exigirVerificado, setExigirVerificado] = useState(perfil.exigir_verificado ?? false);
  const [notificacoes, setNotificacoes] = useState(perfil.aceita_notificacoes ?? true);
  const [cor, setCor] = useState<CorPerfil>(corValida(perfil.cor_destaque));
  const [avatar, setAvatar] = useState(perfil.avatar_url ?? undefined);
  const [catalogo, setCatalogo] = useState<CategoriaVaga[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    freelaiApi.listarCategorias().then(setCatalogo).catch(() => setCatalogo([]));
  }, []);

  const alternar = (slug: string) =>
    setCategorias((atual) => (atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug]));

  async function trocarAvatar(arquivo: File | undefined) {
    if (!arquivo) return;
    if (!["image/jpeg", "image/png"].includes(arquivo.type)) {
      avisar("Use uma imagem JPG ou PNG.", "error");
      return;
    }
    if (arquivo.size > TAMANHO_AVATAR) {
      avisar("A imagem pode ter no máximo 2 MB.", "error");
      return;
    }
    setEnviando(true);
    try {
      const atualizado = await contratanteApi.enviarAvatar(arquivo);
      setAvatar(atualizado.avatar_url ?? undefined);
      avisar("Foto atualizada.", "success");
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setEnviando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  async function removerAvatar() {
    setEnviando(true);
    try {
      await contratanteApi.removerAvatar();
      setAvatar(undefined);
      avisar("Foto removida.", "success");
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setEnviando(false);
    }
  }

  async function salvar(ev: FormEvent) {
    ev.preventDefault();
    setSalvando(true);
    try {
      await contratanteApi.atualizar({
        bio: bio.trim() || null,
        bairro: bairro || null,
        horario_contato: horario || null,
        categorias_interesse: categorias,
        exigir_verificado: exigirVerificado,
        aceita_notificacoes: notificacoes,
        cor_destaque: cor,
      });
      avisar("Perfil atualizado.", "success");
      recarregar();
    } catch (e) {
      avisar(mensagemDeErro(e), "error");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="cor-perfil grid gap-5" style={estiloDaCor(cor)}>
      <Card className="cor-perfil-borda overflow-hidden p-0">
        <div className="cor-perfil-topo flex flex-wrap items-center gap-4 px-5 py-5">
          <AvatarVerified name={perfil.nome} imageUrl={avatar} verified={perfil.verificacao === "verificado"} cor={cor} size="xl" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold">{perfil.nome}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tom={TOM_VERIFICACAO[perfil.verificacao]}>{ROTULO_VERIFICACAO[perfil.verificacao]}</Badge>
              <Badge tom="neutral">{perfil.tipo_pessoa === "pf" ? "Pessoa física" : "Empresa"}</Badge>
              {perfil.destaque && <SeloDestaque />}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={entrada} type="file" accept="image/jpeg,image/png" className="sr-only" aria-label="Escolher foto de perfil" onChange={(e) => void trocarAvatar(e.target.files?.[0])} />
            <Button type="button" variant="secondary" size="sm" loading={enviando} onClick={() => entrada.current?.click()}>
              {avatar ? "Trocar foto" : "Enviar foto"}
            </Button>
            {avatar && (
              <Button type="button" variant="ghost" size="sm" disabled={enviando} onClick={() => void removerAvatar()}>
                Remover
              </Button>
            )}
          </div>
        </div>
        {perfil.verificacao !== "verificado" && (
          <p className="px-5 py-3 text-sm">
            {perfil.verificacao === "recusado" && perfil.verificacao_motivo ? `Motivo da recusa: ${perfil.verificacao_motivo}. ` : ""}
            <Link href="/verificacao" className="font-semibold text-primary hover:underline">Abrir verificação de identidade</Link>
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-borda px-5 py-3 text-sm text-muted">
          <span>Foto em JPG ou PNG, até 2 MB. Sem foto, usamos a inicial do seu nome na cor escolhida.</span>
          <Link href={`/contratante/${usuarioId}`} className="font-semibold cor-perfil-texto hover:underline">
            Ver como os profissionais veem
          </Link>
        </div>
      </Card>

      <form onSubmit={salvar} className="grid gap-5">
        <Card>
          <h3 className="text-lg font-semibold">Sobre você</h3>
          <div className="mt-4 grid gap-4">
            <Textarea
              label="Apresentação"
              value={bio}
              maxLength={LIMITE_BIO}
              rows={3}
              onChange={(e) => setBio(e.target.value)}
              hint={`${bio.length}/${LIMITE_BIO} caracteres. Aparece no seu perfil público.`}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Não informar"
                opcoes={BAIRROS.map((b) => ({ valor: b.nome, rotulo: b.nome }))}
              />
              <Select
                label="Melhor horário de contato"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="Não informar"
                opcoes={[...(horario && !HORARIOS.includes(horario) ? [horario] : []), ...HORARIOS].map((h) => ({ valor: h, rotulo: h }))}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Preferências</h3>
          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">Categorias de interesse</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {catalogo.map((c) => {
                const ativa = categorias.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={ativa}
                    onClick={() => alternar(c.slug)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${ativa ? "cor-perfil-borda cor-perfil-fundo font-semibold" : "border-borda text-muted hover:border-primary/60"}`}
                  >
                    {c.nome}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-4 grid gap-3">
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1" checked={exigirVerificado} onChange={(e) => setExigirVerificado(e.target.checked)} />
              <span><strong>Preferir profissionais verificados.</strong> Mostramos esta preferência no seu perfil público.</span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1" checked={notificacoes} onChange={(e) => setNotificacoes(e.target.checked)} />
              <span><strong>Receber notificações</strong> sobre convites, acordo e pagamento.</span>
            </label>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Cor do perfil</h3>
          <p className="mt-1 text-sm text-muted">A cor aparece na borda, no cabeçalho e nas iniciais do seu perfil.</p>
          <div role="radiogroup" aria-label="Cor de destaque do perfil" className="mt-3 flex flex-wrap gap-3">
            {CORES_PERFIL.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={cor === c}
                aria-label={TONS[c].rotulo}
                onClick={() => setCor(c)}
                className={`cor-perfil flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${cor === c ? "border-fg font-semibold" : "border-borda text-muted hover:border-primary/60"}`}
                style={estiloDaCor(c)}
              >
                <span className="h-4 w-4 rounded-full" style={{ background: "rgb(var(--cor-perfil))" }} aria-hidden="true" />
                {TONS[c].rotulo}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={salvando}>Salvar perfil</Button>
        </div>
      </form>
    </div>
  );
}
