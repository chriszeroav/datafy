import { Inbox } from "lucide-react";
import { aiModelLabel } from "@/lib/ai-models";
import { db } from "@/lib/db";
import { Ticket, TicketPerforation, TicketRow } from "./ticket";
import { formatAmount, formatOperatedAt } from "./upload-config";

// Las sumas las hace Postgres. Sumar Decimal en JavaScript obligaria a pasar
// por punto flotante, justo lo que evitamos al guardar.
const loadPayments = async () => {
  const [payments, totals] = await Promise.all([
    db.payment.findMany({ orderBy: { operatedAt: "desc" }, take: 50 }),
    db.payment.groupBy({ by: ["direction"], _sum: { amount: true } }),
  ]);

  const sumFor = (direction: "INCOMING" | "OUTGOING") =>
    Number(totals.find((row) => row.direction === direction)?._sum.amount ?? 0);

  return {
    payments,
    incoming: sumFor("INCOMING"),
    outgoing: sumFor("OUTGOING"),
  };
};

const SourceTag = ({ source }: { source: "YAPE" | "PLIN" }) => (
  <span
    className={`rounded px-1.5 py-0.5 font-mono text-[0.65rem] font-bold tracking-wider ${
      source === "YAPE" ? "bg-yape/15 text-yape" : "bg-plin/15 text-plin"
    }`}
  >
    {source}
  </span>
);

export const PaymentsPanel = async () => {
  const { payments, incoming, outgoing } = await loadPayments();

  if (payments.length === 0) {
    return (
      <Ticket>
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-5 text-muted-foreground" />
          </span>
          <p className="font-medium">El talonario esta vacio</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Sube tu primera constancia de Yape o Plin y aparecera aqui.
          </p>
        </div>
      </Ticket>
    );
  }

  return (
    <Ticket className="px-4 pt-4 pb-5 sm:px-5">
      <p className="mb-2 font-mono text-[0.7rem] tracking-wider text-muted-foreground">
        {payments.length} {payments.length === 1 ? "movimiento" : "movimientos"}
      </p>

      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[20rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
              <th className="px-1 pb-2 font-semibold">Fecha</th>
              <th className="px-1 pb-2 font-semibold">Medio</th>
              <th className="hidden px-1 pb-2 font-semibold sm:table-cell">
                Operacion
              </th>
              <th className="hidden px-1 pb-2 font-semibold md:table-cell">
                Modelo
              </th>
              <th className="px-1 pb-2 text-right font-semibold">Monto</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-dashed border-border/70 transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-1 py-2.5 font-mono text-xs whitespace-nowrap">
                  {formatOperatedAt(payment.operatedAt.toISOString())}
                </td>
                <td className="px-1 py-2.5">
                  <SourceTag source={payment.source} />
                </td>
                <td className="hidden px-1 py-2.5 font-mono text-xs text-muted-foreground sm:table-cell">
                  {payment.operationCode ?? "—"}
                </td>
                <td className="hidden px-1 py-2.5 text-xs whitespace-nowrap text-muted-foreground md:table-cell">
                  {aiModelLabel(payment.model)}
                </td>
                <td
                  className={`px-1 py-2.5 text-right font-mono font-medium tabular-nums whitespace-nowrap ${
                    payment.direction === "INCOMING"
                      ? "text-plin"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {payment.direction === "INCOMING" ? "+" : "-"}
                  {/* Decimal se convierte solo para mostrar, nunca para calcular */}
                  {formatAmount(Number(payment.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TicketPerforation />

      {/* Los totales van al pie, como en un ticket impreso */}
      <div className="space-y-1.5">
        <TicketRow label="Ingresos" value={formatAmount(incoming)} tone="in" />
        <TicketRow label="Egresos" value={formatAmount(outgoing)} tone="out" />
        <div className="pt-1">
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 text-xs font-bold tracking-wider uppercase">
              Balance
            </span>
            <span className="min-w-4 flex-1 translate-y-[-0.25rem] border-b border-border" />
            <span className="shrink-0 font-mono text-lg font-bold tabular-nums">
              {formatAmount(incoming - outgoing)}
            </span>
          </div>
        </div>
      </div>
    </Ticket>
  );
};

export const PaymentsPanelSkeleton = () => (
  <Ticket className="p-4">
    <div className="space-y-3">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="h-9 animate-pulse rounded bg-muted" />
      ))}
    </div>
  </Ticket>
);
