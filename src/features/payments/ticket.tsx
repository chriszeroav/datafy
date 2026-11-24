import type { ReactNode } from "react";

// Primitivas de la estetica de constancia: las mismas muescas y la misma
// linea de corte que traen los comprobantes reales de Interbank.

export const Ticket = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`relative rounded-2xl border border-border bg-card shadow-[0_1px_0_0_var(--border),0_12px_32px_-18px_oklch(0.3_0.05_300/0.45)] ${className}`}
  >
    {children}
  </div>
);

// Linea de corte con las dos muescas laterales. Los circulos van del color del
// fondo de pagina, asi que parecen mordidas en el papel.
export const TicketPerforation = () => (
  <div className="relative py-3">
    <span className="absolute top-1/2 -left-2.5 size-5 -translate-y-1/2 rounded-full bg-background" />
    <span className="absolute top-1/2 -right-2.5 size-5 -translate-y-1/2 rounded-full bg-background" />
    <div className="border-t-2 border-dashed border-border" />
  </div>
);

// Fila con puntos guia entre la etiqueta y la cifra, como un ticket impreso.
export const TicketRow = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "in" | "out";
}) => (
  <div className="flex items-baseline gap-2 text-sm">
    <span className="shrink-0 text-xs tracking-wider text-muted-foreground uppercase">
      {label}
    </span>
    <span className="min-w-4 flex-1 translate-y-[-0.25rem] border-b border-dotted border-border" />
    <span
      className={`shrink-0 font-mono font-medium tabular-nums ${
        tone === "in"
          ? "text-plin"
          : tone === "out"
            ? "text-amber-600 dark:text-amber-400"
            : ""
      }`}
    >
      {value}
    </span>
  </div>
);
