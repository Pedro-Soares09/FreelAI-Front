"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/api/erro";
import { Pagina } from "@/components/layout/pagina";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { freelaiApi, type CategoriaVaga } from "@/services/api";

// Bairros de Recife com coordenadas de referência para o cálculo de distância do match.
const BAIRROS = [
  { nome: "Boa Vista", latitude: -8.063, longitude: -34.876 },
  { nome: "Boa Viagem", latitude: -8.119, longitude: -34.904 },
  { nome: "Casa Forte", latitude: -8.036, longitude: -34.918 },
  { nome: "Derby", latitude: -8.054, longitude: -34.899 },
  { nome: "Espinheiro", latitude: -8.04, longitude: -34.896 },
  { nome: "Graças", latitude: -8.042, longitude: -34.898 },
  { nome: "Madalena", latitude: -8.052, longitude: -34.901 },
  { nome: "Torre", latitude: -8.048, longitude: -34.912 },
  { nome: "Várzea", latitude: -8.05, longitude: -34.95 },
];

type Erros = Partial<Record<"titulo" | "descricao" | "categoria" | "valor" | "duracao" | "data" | "bairro", string>>;

export default function CreateJobPage() {
  const router = useRouter();
  const { avisar } = useToast();
  const [categorias, setCategorias] = useState<CategoriaVaga[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [duracao, setDuracao] = useState("");
  const [data, setData] = useState("");
  const [bairro, setBairro] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    freelaiApi
      .listarCategorias()
      .then(setCategorias)
      .catch(() => avisar("Não foi possível carregar as categorias.", "error"));
  }, [avisar]);

  function validar(): Erros {
    const e: Erros = {};
    if (titulo.trim().length < 3) e.titulo = "Informe um título com pelo menos 3 caracteres.";
    if (descricao.trim().length < 5) e.descricao = "Descreva o serviço em pelo menos 5 caracteres.";
    if (!categoria) e.categoria = "Escolha a categoria.";
    if (!(Number(valor) > 0)) e.valor = "Informe um valor maior que zero.";
    if (!(Number(duracao) > 0 && Number(duracao) <= 24)) e.duracao = "Informe entre 0,5 e 24 horas.";
    if (!data) e.data = "Informe a data e a hora de início.";
    if (!bairro) e.bairro = "Escolha o bairro.";
    return e;
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    const local = BAIRROS.find((b) => b.nome === bairro)!;
    setEnviando(true);
    try {
      await freelaiApi.criarVaga({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        valor: Number(valor),
        duracao_horas: Number(duracao),
        data_inicio: new Date(data).toISOString(),
        bairro: local.nome,
        logradouro: logradouro.trim() || undefined,
        latitude: local.latitude,
        longitude: local.longitude,
      });
      avisar("Vaga publicada. Veja os três melhores profissionais.", "success");
      router.push("/match");
    } catch (erro) {
      const mensagem = erro instanceof ApiError ? erro.message : "Não foi possível publicar a vaga.";
      avisar(mensagem, "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pagina titulo="Criar vaga" descricao="Descreva o serviço e a FREELAI encontra os três melhores profissionais.">
      <form onSubmit={enviar} noValidate className="mx-auto flex max-w-2xl flex-col gap-4 rounded-card border border-borda bg-surface p-5 sm:p-6">
        <Input label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} error={erros.titulo} maxLength={120} />
        <Select
          label="Categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Selecione"
          opcoes={categorias.map((c) => ({ valor: c.slug, rotulo: c.nome }))}
          error={erros.categoria}
        />
        <Textarea label="Descrição do serviço" value={descricao} onChange={(e) => setDescricao(e.target.value)} error={erros.descricao} rows={4} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Valor (R$)" type="number" inputMode="decimal" min="1" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} error={erros.valor} />
          <Input label="Duração (horas)" type="number" inputMode="decimal" min="0.5" step="0.5" value={duracao} onChange={(e) => setDuracao(e.target.value)} error={erros.duracao} />
        </div>
        <Input label="Início" type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} error={erros.data} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Selecione"
            opcoes={BAIRROS.map((b) => ({ valor: b.nome, rotulo: b.nome }))}
            error={erros.bairro}
          />
          <Input label="Rua e número (opcional)" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} hint="Só aparece para o profissional depois do aceite." />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={enviando}>
            Publicar vaga
          </Button>
        </div>
      </form>
    </Pagina>
  );
}
