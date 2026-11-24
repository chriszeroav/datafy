import { generateObject } from "ai";
import { getModel } from "@/lib/ai";
import { paymentExtractionSchema } from "./payment-schema";

const SYSTEM_PROMPT = `Eres un extractor de datos de constancias de pago peruanas (Yape y Plin).
Lee la imagen y devuelve unicamente los campos del esquema.

Reglas:
- source: YAPE si la captura es de la app Yape (fondo morado, textos "Yapeaste" o
  "Te Yapearon"). PLIN si es un comprobante de Plin dentro de la app de un banco
  (textos como "Plineo exitoso", o un destino marcado como "Plin").
- direction: OUTGOING cuando el dinero sale de quien tomo la captura ("Yapeaste",
  "Plineo exitoso", "Enviado a"). INCOMING cuando entra ("Te Yapearon",
  "Recibiste"). Un monto con signo negativo es OUTGOING; con signo positivo,
  INCOMING.
- amount: siempre positivo y sin simbolo. "S/ 17" es 17. "S/ -4.00" es 4.
- operationCode: el numero junto a "Nro. de operacion" o "Codigo de operacion".
  NO es el "codigo de seguridad" de tres digitos que muestra Yape.
- operatedDate: la fecha de la operacion, no la fecha de proceso. Los meses vienen
  abreviados en espanol: ene, feb, mar, abr, may, jun, jul, ago, sep, oct, nov, dic.
- operatedTime: en 24 horas. "9:52 p.m." es 21:52, "07:42 PM" es 19:42,
  "12:13 PM" es 12:13, "12:30 AM" es 00:30.`;

export const extractPayment = async (image: Uint8Array, mediaType: string) => {
  const { object, usage } = await generateObject({
    model: getModel(),
    schema: paymentExtractionSchema,
    system: SYSTEM_PROMPT,
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

  return { extraction: object, usage };
};
