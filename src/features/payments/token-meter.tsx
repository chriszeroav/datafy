"use client";

import { ChevronDown, Gauge } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  sumTokenUsage,
  type TokenUsage,
} from "@/features/extraction/token-usage";

type TokenMeterProps = {
  // Una entrada por llamada al modelo hecha en esta sesion del navegador.
  history: readonly TokenUsage[];
};

const number = (value: number) => value.toLocaleString("es-PE");

const Row = ({
  label,
  hint,
  value,
}: {
  label: string;
  hint?: string;
  value: number;
}) => (
  <div className="flex items-baseline justify-between gap-3 py-1">
    <span className="text-muted-foreground">
      {label}
      {hint && <span className="ml-1 opacity-60">{hint}</span>}
    </span>
    <span className="font-mono tabular-nums">{number(value)}</span>
  </div>
);

export const TokenMeter = ({ history }: TokenMeterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // El portal necesita document, que no existe durante el render del servidor.
  useEffect(() => setIsMounted(true), []);

  // Instrumento de desarrollo: no se muestra en produccion. Next sustituye
  // NODE_ENV al compilar, asi que la rama queda resuelta en el bundle.
  if (process.env.NODE_ENV === "production" || !isMounted) return null;

  const last = history.at(-1);
  const totals = sumTokenUsage(history);
  const calls = history.length;

  // Va por portal al body: el contenedor del formulario es sticky, y eso crea
  // un contexto de apilamiento que dejaria este panel por debajo de la tabla
  // por mucho z-index que le pusieramos.
  return createPortal(
    <aside className="fixed right-4 bottom-4 z-50 w-[min(19rem,calc(100vw-2rem))] text-xs">
      {isOpen && (
        <div className="mb-2 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
          {last ? (
            <>
              <div className="divide-y divide-border/40">
                <Row
                  label="Entrada"
                  hint={`(${number(last.cachedInput)} de cache)`}
                  value={last.input}
                />
                <Row
                  label="Salida"
                  hint={`(${number(last.reasoning)} de razonamiento)`}
                  value={last.output}
                />
                <Row label="Total" value={last.total} />
              </div>
              <p className="mt-2 border-t border-border/40 pt-2 text-muted-foreground">
                {calls} {calls === 1 ? "llamada" : "llamadas"} ·{" "}
                <span className="font-mono tabular-nums">
                  {number(totals.total)}
                </span>{" "}
                tokens ·{" "}
                <span className="font-mono tabular-nums">
                  {number(Math.round(totals.total / calls))}
                </span>{" "}
                de promedio
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Todavia no se ha llamado al modelo en esta sesion.
            </p>
          )}
          <p className="mt-2 text-[0.65rem] text-muted-foreground opacity-70">
            Cifras tal cual las devuelve la API, no estimaciones.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card/95 py-2 pr-3 pl-3 shadow-lg backdrop-blur transition-colors hover:bg-muted"
      >
        <Gauge className="size-3.5 text-violet-500" />
        <span className="font-mono tabular-nums">
          {last ? number(last.total) : "0"}
        </span>
        <span className="text-muted-foreground">tokens</span>
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </aside>,
    document.body,
  );
};
