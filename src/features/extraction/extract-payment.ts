import { generateObject, type LanguageModelUsage } from "ai";
import { getModel } from "@/lib/ai";
import type { AiModelId } from "@/lib/ai-models";
import { paymentExtractionSchema } from "./payment-schema";
import type { TokenUsage } from "./token-usage";

// Todos los campos del SDK son opcionales porque no todo proveedor los informa.
const toTokenUsage = (usage: LanguageModelUsage): TokenUsage => ({
  input: usage.inputTokens ?? 0,
  cachedInput: usage.inputTokenDetails.cacheReadTokens ?? 0,
  output: usage.outputTokens ?? 0,
  reasoning: usage.outputTokenDetails.reasoningTokens ?? 0,
  total: usage.totalTokens ?? 0,
});

const SYSTEM_PROMPT = `Lees capturas de constancias de pago peruanas y transcribes lo que ves.
No interpretes ni completes datos: si algo no aparece en la imagen, no lo inventes.

Formatos que existen (screenType):

YAPE_RECEIPT: app Yape. Cabecera morada con el logo de Yape, titulo "¡Yapeaste!" o
"¡Te Yapearon!", monto sin signo, nombre de la persona, "CODIGO DE SEGURIDAD" con
tres digitos y una seccion "DATOS DE LA TRANSACCION" con "Nro. de operacion".

PLIN_RECEIPT: confirmacion de Plin dentro de la app de Interbank. Fondo verde, logo
de Interbank, titulo "Plineo exitoso", "Enviado a" con un celular seguido de
"- Plin" y "Codigo de operacion".

INTERBANK_MOVEMENT: detalle de un movimiento en la app de Interbank. Fondo verde,
logo de Interbank, titulo "Detalle de movimiento", monto que puede llevar signo
menos, "Tipo de operacion" y "Fecha del proceso". No tiene numero de operacion.

UNKNOWN: cualquier otra cosa, o si dudas entre formatos.

Campos:
- title: el titulo tal como aparece.
- amountText: el monto copiado tal cual, con "S/" y con el signo menos si lo tiene.
  No quites ni agregues signos.
- operationCode: solo el numero junto a "Nro. de operacion" o "Codigo de operacion".
  null si no aparece. No uses el codigo de seguridad, el celular, la fecha ni el
  texto de "Tipo de operacion".
- operatedDate: la fecha de la operacion, la que esta junto al monto. Ignora
  "Fecha del proceso". Los meses vienen abreviados: ene, feb, mar, abr, may, jun,
  jul, ago, sep, oct, nov, dic.
- operatedTime: en 24 horas. "9:52 p.m." es 21:52, "07:42 PM" es 19:42,
  "12:13 PM" es 12:13, "12:30 AM" es 00:30.`;

export const extractPayment = async (
  image: Uint8Array,
  mediaType: string,
  modelId: AiModelId,
) => {
  const { object, usage } = await generateObject({
    model: getModel(modelId),
    schema: paymentExtractionSchema,
    system: SYSTEM_PROMPT,
    // Transcribir no necesita creatividad: lo que se busca es que la misma
    // captura de siempre el mismo resultado.
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extrae los datos de esta constancia." },
          { type: "image", image, mediaType },
        ],
      },
    ],
  });

  return { extraction: object, usage: toTokenUsage(usage) };
};
