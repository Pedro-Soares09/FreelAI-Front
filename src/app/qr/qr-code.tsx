"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

const TAMANHO = 360;

export function QrCodeAcesso() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [endereco, setEndereco] = useState<string>(process.env.NEXT_PUBLIC_APP_URL ?? "");
  const [erro, setErro] = useState(false);

  // Sem NEXT_PUBLIC_APP_URL, usa o endereço em que a página foi aberta.
  useEffect(() => {
    if (!endereco) setEndereco(window.location.origin);
  }, [endereco]);

  useEffect(() => {
    if (!endereco || !canvas.current) return;
    QRCode.toCanvas(canvas.current, endereco, {
      width: TAMANHO,
      margin: 2,
      color: { dark: "#0e0a1e", light: "#ffffff" },
    }).catch(() => setErro(true));
  }, [endereco]);

  function baixar() {
    if (!canvas.current) return;
    const link = document.createElement("a");
    link.href = canvas.current.toDataURL("image/png");
    link.download = "freelai-beta-qrcode.png";
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvas}
        width={TAMANHO}
        height={TAMANHO}
        role="img"
        aria-label={`QR Code para acessar ${endereco}`}
        className="h-auto w-full max-w-[360px] rounded-card border border-borda bg-white"
      />
      {erro && (
        <p role="alert" className="text-sm text-danger">
          Não foi possível gerar o QR Code.
        </p>
      )}
      <p className="break-all text-center text-sm text-muted">{endereco}</p>
      <button type="button" onClick={baixar} className="cta" disabled={!endereco || erro}>
        Baixar QR Code (PNG)
      </button>
    </div>
  );
}
