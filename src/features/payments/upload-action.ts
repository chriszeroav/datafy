"use server";

import { extractPayment } from "@/features/extraction/extract-payment";
import { toOperatedAt } from "@/features/extraction/payment-schema";
import {
  formatBytes,
  isAcceptedMimeType,
  MAX_FILE_SIZE_BYTES,
} from "./upload-config";
import type { UploadResult } from "./upload-result";

export const uploadScreenshot = async (
  _previous: UploadResult,
  formData: FormData,
): Promise<UploadResult> => {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Elige una captura antes de enviar." };
  }

  // El atributo accept del input solo filtra el dialogo del sistema operativo:
  // cualquiera puede saltarselo, asi que el tipo se comprueba aqui tambien.
  if (!isAcceptedMimeType(file.type)) {
    return {
      status: "error",
      message: "Formato no admitido. Sube una imagen PNG, JPEG o WebP.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      status: "error",
      message: `La imagen pesa ${formatBytes(file.size)} y el maximo es ${formatBytes(MAX_FILE_SIZE_BYTES)}.`,
    };
  }

  // La imagen se lee en memoria, viaja al modelo y se descarta al terminar la
  // peticion: no toca el disco ni la base.
  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const { extraction, usage } = await extractPayment(bytes, file.type);

    return {
      status: "success",
      fileName: file.name,
      sizeBytes: bytes.byteLength,
      payment: {
        source: extraction.source,
        direction: extraction.direction,
        operationCode: extraction.operationCode,
        amount: extraction.amount,
        operatedAt: toOperatedAt(extraction).toISOString(),
      },
      tokens: usage.totalTokens ?? 0,
    };
  } catch (error) {
    // Falla si el modelo no responde o si devuelve algo que Zod rechaza.
    return {
      status: "error",
      message:
        error instanceof Error
          ? `No se pudo leer la constancia: ${error.message}`
          : "No se pudo leer la constancia.",
    };
  }
};
