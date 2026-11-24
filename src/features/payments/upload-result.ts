// El resultado vive aparte porque un archivo "use server" solo puede exportar
// funciones async: una constante exportada desde ahi rompe la compilacion.

export type UploadResult =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "success";
      fileName: string;
      mimeType: string;
      sizeBytes: number;
    };

export const INITIAL_UPLOAD_RESULT: UploadResult = { status: "idle" };
