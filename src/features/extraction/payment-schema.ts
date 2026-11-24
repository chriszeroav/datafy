import { z } from "zod";

// Lo que se le pide al modelo. Los .describe() no son comentarios: viajan al
// modelo dentro del JSON Schema y son la forma principal de dirigirlo.
export const paymentExtractionSchema = z.object({
  source: z
    .enum(["YAPE", "PLIN"])
    .describe("Billetera de la que proviene la constancia."),
  direction: z
    .enum(["INCOMING", "OUTGOING"])
    .describe("INCOMING si el dinero entro, OUTGOING si salio."),
  operationCode: z
    .string()
    .min(1)
    .describe(
      "Numero junto a 'Nro. de operacion' o 'Codigo de operacion'. No es el codigo de seguridad de tres digitos.",
    ),
  amount: z
    .number()
    .positive()
    .describe("Monto en soles, siempre positivo y sin simbolo de moneda."),
  operatedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Fecha de la operacion en formato YYYY-MM-DD."),
  operatedTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .describe("Hora de la operacion en formato de 24 horas HH:mm."),
});

export type PaymentExtraction = z.infer<typeof paymentExtractionSchema>;

// Peru es UTC-5 todo el año y no tiene horario de verano, asi que un desfase
// fijo es correcto aqui. En un pais con cambio de hora esto estaria mal.
const LIMA_UTC_OFFSET = "-05:00";

export const toOperatedAt = (extraction: PaymentExtraction): Date =>
  new Date(
    `${extraction.operatedDate}T${extraction.operatedTime}:00${LIMA_UTC_OFFSET}`,
  );
