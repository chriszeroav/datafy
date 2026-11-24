import type { TokenUsage } from "@/features/extraction/token-usage";

// El resultado vive aparte porque un archivo "use server" solo puede exportar
// funciones async: una constante exportada desde ahi rompe la compilacion.

export type ExtractedPayment = {
  source: "YAPE" | "PLIN";
  direction: "INCOMING" | "OUTGOING";
  operationCode: string;
  amount: number;
  // ISO en UTC, ya convertido desde la hora de Lima que mostraba la captura
  operatedAt: string;
};

export type UploadResult =
  | { status: "idle" }
  | { status: "error"; message: string }
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
