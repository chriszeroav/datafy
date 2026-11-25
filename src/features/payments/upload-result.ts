import type { TokenUsage } from "@/features/extraction/token-usage";

// El resultado vive aparte porque un archivo "use server" solo puede exportar
// funciones async: una constante exportada desde ahi rompe la compilacion.

export type ExtractedPayment = {
  source: "YAPE" | "PLIN";
  direction: "INCOMING" | "OUTGOING";
  // null cuando la captura no lo muestra (detalle de movimiento de Interbank)
  operationCode: string | null;
  amount: number;
  // ISO en UTC, ya convertido desde la hora de Lima que mostraba la captura
  operatedAt: string;
  // id del catalogo de ai-models con el que se leyo la captura
  model: string;
};

export type UploadResult =
  | { status: "idle" }
  // usage solo cuando el modelo llego a responder: esa llamada tambien se pago.
  | { status: "error"; message: string; usage?: TokenUsage }
  // No es un error: la constancia se leyo bien, pero ya estaba registrada.
  // Lleva usage igual, porque la llamada al modelo ya se pago.
  | { status: "duplicate"; payment: ExtractedPayment; usage: TokenUsage }
  | {
      status: "success";
      fileName: string;
      sizeBytes: number;
      payment: ExtractedPayment;
      usage: TokenUsage;
    };

export const INITIAL_UPLOAD_RESULT: UploadResult = { status: "idle" };
