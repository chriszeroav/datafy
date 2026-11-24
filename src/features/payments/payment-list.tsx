import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatAmount, formatOperatedAt } from "./upload-config";

// Componente de servidor sin "use cache": la lista tiene que estar fresca en
// cada peticion, asi que la pagina lo envuelve en <Suspense>.
export const PaymentList = async () => {
  const payments = await db.payment.findMany({
    orderBy: { operatedAt: "desc" },
    take: 50,
  });

  if (payments.length === 0) {
    return (
      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Todavia no hay pagos registrados. Sube tu primera constancia.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Medio</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Codigo
                </th>
                <th className="px-4 py-3 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatOperatedAt(payment.operatedAt.toISOString())}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        payment.source === "YAPE"
                          ? "bg-violet-500/20 text-violet-700 dark:text-violet-300"
                          : "bg-teal-500/20 text-teal-700 dark:text-teal-300"
                      }`}
                    >
                      {payment.source}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs whitespace-nowrap sm:table-cell">
                    {payment.operationCode}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                      payment.direction === "INCOMING"
                        ? "text-emerald-600 dark:text-emerald-400"
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
      </CardContent>
    </Card>
  );
};

export const PaymentListSkeleton = () => (
  <Card className="border-border/60 bg-card/70 backdrop-blur">
    <CardContent className="space-y-3 p-4">
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-8 animate-pulse rounded bg-muted/60" />
      ))}
    </CardContent>
  </Card>
);
