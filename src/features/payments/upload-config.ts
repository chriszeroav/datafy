// Compartido entre el formulario y la server action: el cliente lo usa para el
// atributo accept y los mensajes, el servidor para validar de verdad.

// 5 MB: una captura de celular ronda entre 1 y 3 MB.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

export const isAcceptedMimeType = (value: string): value is AcceptedMimeType =>
  ACCEPTED_MIME_TYPES.includes(value as AcceptedMimeType);

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const amountFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export const formatAmount = (amount: number): string =>
  amountFormatter.format(amount);

// Se guarda en UTC y se muestra en hora de Lima: el viaje de ida y vuelta
// tiene que devolver la hora que decia la captura.
const operatedAtFormatter = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Lima",
});

export const formatOperatedAt = (isoDate: string): string =>
  operatedAtFormatter.format(new Date(isoDate));
