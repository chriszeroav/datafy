import { z } from "zod";

// Lo que se le pide al modelo: identificar el formato y transcribir lo que ve.
// Las decisiones (medio, direccion, monto) las toma interpretExtraction() con
// reglas fijas, porque un modelo adivina distinto en cada intento y el codigo no.
//
// Los .describe() no son comentarios: viajan al modelo dentro del JSON Schema y
// son la forma principal de dirigirlo.
export const paymentExtractionSchema = z.object({
  screenType: z
    .enum(["YAPE_RECEIPT", "PLIN_RECEIPT", "INTERBANK_MOVEMENT", "UNKNOWN"])
    .describe(
      "Formato de la captura. UNKNOWN si no coincide claramente con ninguno de los descritos.",
    ),
  title: z
    .string()
    .describe(
      "Titulo principal tal como aparece, sin corregirlo. Ej: '¡Yapeaste!', '¡Te Yapearon!', 'Plineo exitoso', 'Detalle de movimiento'.",
    ),
  amountText: z
    .string()
    .describe(
      "Monto principal copiado tal cual, con el simbolo y con el signo si lo tiene. Ej: 'S/ 17', 'S/ 5.00', 'S/ -4.00'.",
    ),
  operationCode: z
    .string()
    .nullable()
    .describe(
      "Numero junto a 'Nro. de operacion' o 'Codigo de operacion'. null si la captura no muestra ese dato. Nunca el codigo de seguridad de tres digitos ni otro texto.",
    ),
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

type Source = "YAPE" | "PLIN";
type Direction = "INCOMING" | "OUTGOING";

export type InterpretedPayment = {
  source: Source;
  direction: Direction;
  amount: number;
  operationCode: string | null;
  operatedAt: Date;
};

type Interpretation =
  | { ok: true; payment: InterpretedPayment }
  | { ok: false; reason: string };

// Peru es UTC-5 todo el año y no tiene horario de verano, asi que un desfase
// fijo es correcto aqui. En un pais con cambio de hora esto estaria mal.
const LIMA_UTC_OFFSET = "-05:00";

const toOperatedAt = (extraction: PaymentExtraction): Date =>
  new Date(
    `${extraction.operatedDate}T${extraction.operatedTime}:00${LIMA_UTC_OFFSET}`,
  );

// Plin vive dentro de la app de Interbank: todo lo que sale de ahi es Plin.
const SOURCE_BY_SCREEN: Record<
  Exclude<PaymentExtraction["screenType"], "UNKNOWN">,
  Source
> = {
  YAPE_RECEIPT: "YAPE",
  PLIN_RECEIPT: "PLIN",
  INTERBANK_MOVEMENT: "PLIN",
};

// Minusculas y sin tildes ni signos, para comparar titulos sin depender de
// como los transcribio el modelo.
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¡!]/g, "")
    .trim()
    .toLowerCase();

// "S/ -4.00" -> { negative: true, value: 4 }. Las comas se toman como
// separador de miles ("S/ 1,250.00"), que es como las muestran estas apps.
const parseAmount = (text: string) => {
  const negative = /-\s*\d/.test(text);
  const digits = text.replace(/[^\d.]/g, "");
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) && value > 0 ? { negative, value } : null;
};

const directionFrom = (
  extraction: PaymentExtraction,
  negative: boolean,
): Direction | null => {
  const title = normalize(extraction.title);

  switch (extraction.screenType) {
    case "YAPE_RECEIPT":
      if (title.includes("te yapearon")) return "INCOMING";
      if (title.includes("yapeaste")) return "OUTGOING";
      return null;
    case "PLIN_RECEIPT":
      // La confirmacion solo aparece al enviar: lo recibido se ve en movimientos.
      return title.includes("plineo exitoso") ? "OUTGOING" : null;
    case "INTERBANK_MOVEMENT":
      // En el detalle de movimiento el unico indicio es el signo del monto.
      return negative ? "OUTGOING" : "INCOMING";
    case "UNKNOWN":
      return null;
  }
};

export const interpretExtraction = (
  extraction: PaymentExtraction,
): Interpretation => {
  if (extraction.screenType === "UNKNOWN") {
    return {
      ok: false,
      reason:
        "No reconozco el formato. Por ahora se aceptan constancias de Yape y de Plin en Interbank.",
    };
  }

  const amount = parseAmount(extraction.amountText);
  if (!amount) {
    return {
      ok: false,
      reason: `No pude entender el monto "${extraction.amountText}".`,
    };
  }

  const direction = directionFrom(extraction, amount.negative);
  if (!direction) {
    return {
      ok: false,
      reason: `No pude saber si el dinero entro o salio (titulo: "${extraction.title}").`,
    };
  }

  const operatedAt = toOperatedAt(extraction);
  if (Number.isNaN(operatedAt.getTime())) {
    return { ok: false, reason: "La fecha u hora de la captura no es valida." };
  }

  // Un codigo vacio o sin digitos es un relleno del modelo, no un dato.
  const code = extraction.operationCode?.trim() ?? "";
  const operationCode = /^\d+$/.test(code) ? code : null;

  return {
    ok: true,
    payment: {
      source: SOURCE_BY_SCREEN[extraction.screenType],
      direction,
      amount: amount.value,
      operationCode,
      operatedAt,
    },
  };
};
