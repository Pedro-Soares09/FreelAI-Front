'use client';

import React, { useEffect, useState } from 'react';
import { freelaiApi } from '@/services/api';
import { PerfilAtivo, Vaga } from '@/types';
import { useConfirmar } from '@/components/ui/confirmar';

interface CheckinPanelProps {
  vaga: Vaga;
  perfilAtivo: PerfilAtivo;
  onAtualizar: () => void;
}

export function CheckinPanel({
  vaga,
  perfilAtivo,
  onAtualizar,
}: CheckinPanelProps) {
  const confirmar = useConfirmar();
  const [enviando, setEnviando] = useState(false);
  const [isModoDemo, setIsModoDemo] = useState(true);
  const [feedback, setFeedback] = useState<{
    tipo: 'sucesso' | 'erro';
    texto: string;
  } | null>(null);

  useEffect(() => {
    const demoStorage = localStorage.getItem('freelai_perfil_demo') === 'true';
    const mocksEnv = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';
    setIsModoDemo(
      demoStorage || mocksEnv || process.env.NODE_ENV !== 'production'
    );
  }, []);

  const inicioMs = new Date(vaga.data_inicio).getTime();
  const agoraMs = Date.now();
  const minutosParaInicio = (inicioMs - agoraMs) / 60_000;
  const minutosAposInicio = (agoraMs - inicioMs) / 60_000;

  const janelaCheckinAberta = minutosParaInicio <= 30;
  const podeRegistrarFalta =
    minutosAposInicio >= 30 &&
    !vaga.checkin_realizado_em &&
    !vaga.falta_registrada;

  const executarCheckin = async (simularLocal: boolean) => {
    setEnviando(true);
    setFeedback(null);

    try {
      let latitude = vaga.latitude;
      let longitude = vaga.longitude;

      if (!simularLocal) {
        if (!('geolocation' in navigator)) {
          throw new Error('Geolocalização não suportada neste navegador.');
        }
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      }

      const resp = await freelaiApi.fazerCheckinGps(vaga.id, {
        latitude,
        longitude,
        simular_local: simularLocal,
      });

      setFeedback({
        tipo: 'sucesso',
        texto:
          resp.mensagem ||
          `Check-in confirmado (${Math.round(resp.distancia_metros)} m do local).`,
      });
      onAtualizar();
    } catch (e) {
      setFeedback({
        tipo: 'erro',
        texto:
          e instanceof Error
            ? e.message
            : 'Não foi possível validar sua localização (< 300 m do local).',
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleRegistrarFalta = async () => {
    if (
      !await confirmar(
        'Confirmar falta do profissional? O valor retido será estornado integralmente.'
      )
    ) {
      return;
    }
    setEnviando(true);
    setFeedback(null);
    try {
      const resp = await freelaiApi.registrarFalta(vaga.id);
      setFeedback({
        tipo: 'sucesso',
        texto: resp.mensagem || 'Falta registrada e estorno integral iniciado.',
      });
      onAtualizar();
    } catch (e) {
      setFeedback({
        tipo: 'erro',
        texto: e instanceof Error ? e.message : 'Erro ao registrar falta.',
      });
    } finally {
      setEnviando(false);
    }
  };

  if (
    !['contratada', 'em_execucao'].includes(vaga.status) &&
    !vaga.checkin_realizado_em
  ) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-2xl border border-borda bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-fg">
          Presença e Check-in por GPS
        </h3>
        {vaga.checkin_realizado_em && (
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Check-in realizado às{' '}
            {new Date(vaga.checkin_realizado_em).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {perfilAtivo === 'profissional' && !vaga.checkin_realizado_em && (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            O check-in exige estar a menos de 300 m do endereço e fica disponível
            a partir de 30 minutos antes do início.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={enviando || !janelaCheckinAberta}
              onClick={() => executarCheckin(false)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-fg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? 'Validando GPS...' : 'Fazer check-in por GPS'}
            </button>

            {isModoDemo && (
              <button
                type="button"
                disabled={enviando}
                onClick={() => executarCheckin(true)}
                className="rounded-xl border border-accent/50 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/20 disabled:opacity-50"
              >
                Simular posição no local (Demo)
              </button>
            )}
          </div>
        </div>
      )}

      {perfilAtivo === 'contratante' && podeRegistrarFalta && (
        <div className="space-y-2">
          <p className="text-xs text-warning">
            Já se passaram mais de 30 minutos do início sem check-in do
            profissional.
          </p>
          <button
            type="button"
            disabled={enviando}
            onClick={handleRegistrarFalta}
            className="rounded-xl bg-danger px-4 py-2 text-xs font-bold text-fg hover:brightness-110 disabled:opacity-50"
          >
            {enviando ? 'Registrando...' : 'Registrar falta'}
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`rounded-xl p-3 text-xs font-medium ${
            feedback.tipo === 'sucesso'
              ? 'border border-primary/40 bg-primary/10 text-primary'
              : 'border border-danger/40 bg-danger/10 text-danger'
          }`}
        >
          {feedback.texto}
        </div>
      )}
    </section>
  );
}
