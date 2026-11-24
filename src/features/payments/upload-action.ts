"use server";

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

  // La imagen se lee en memoria y se descarta al terminar la peticion: no toca
  // el disco ni la base. En el paso 5 este mismo buffer es lo que vera la IA.
  const bytes = await file.arrayBuffer();

  return {
    status: "success",
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: bytes.byteLength,
  };
};
