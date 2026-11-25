import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { ExtractedPayment } from "./upload-result";

type SaveOutcome = { saved: true } | { saved: false; reason: "duplicate" };

// El detalle de movimiento de Interbank no trae numero de operacion, asi que
// el indice unico no lo cubre. Se considera la misma constancia si coinciden
// medio, direccion, monto y minuto. Tambien atrapa el caso de subir la
// confirmacion de un plineo y despues su detalle de movimiento (o al reves).
// El costo aceptado: dos pagos reales identicos en el mismo minuto cuentan
// como uno.
const hasTwinWithoutCode = async (
  payment: ExtractedPayment,
  amount: string,
): Promise<boolean> => {
  const twin = await db.payment.findFirst({
    select: { id: true },
    where: {
      source: payment.source,
      direction: payment.direction,
      amount,
      operatedAt: new Date(payment.operatedAt),
      // Con codigo, solo choca con filas sin codigo: dos filas con codigos
      // distintos son pagos distintos aunque coincida todo lo demas.
      ...(payment.operationCode === null ? {} : { operationCode: null }),
    },
  });
  return twin !== null;
};

export const savePayment = async (
  payment: ExtractedPayment,
): Promise<SaveOutcome> => {
  // Se manda como texto: el dinero no debe pasar por punto flotante camino a
  // una columna Decimal.
  const amount = payment.amount.toFixed(2);

  if (await hasTwinWithoutCode(payment, amount)) {
    return { saved: false, reason: "duplicate" };
  }

  try {
    await db.payment.create({
      data: {
        source: payment.source,
        direction: payment.direction,
        operationCode: payment.operationCode,
        amount,
        operatedAt: new Date(payment.operatedAt),
        model: payment.model,
      },
    });

    return { saved: true };
  } catch (error) {
    // P2002 es la violacion del indice unico (source, operationCode): la misma
    // constancia ya esta registrada. Es esperable, no un fallo.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { saved: false, reason: "duplicate" };
    }

    throw error;
  }
};
