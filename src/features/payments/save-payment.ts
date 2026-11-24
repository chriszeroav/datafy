import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { ExtractedPayment } from "./upload-result";

type SaveOutcome = { saved: true } | { saved: false; reason: "duplicate" };

export const savePayment = async (
  payment: ExtractedPayment,
): Promise<SaveOutcome> => {
  try {
    await db.payment.create({
      data: {
        source: payment.source,
        direction: payment.direction,
        operationCode: payment.operationCode,
        // Se manda como texto: el dinero no debe pasar por punto flotante
        // camino a una columna Decimal.
        amount: payment.amount.toFixed(2),
        operatedAt: new Date(payment.operatedAt),
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
