// Catalogo de modelos que se pueden elegir. Vive aparte de ai.ts porque lo
// importa el formulario del cliente: aqui no puede haber SDKs ni claves.
//
// El id es lo que viaja desde el navegador y lo que se guarda en cada pago. El
// servidor solo acepta ids de esta lista, nunca un nombre de modelo libre.
export const AI_MODELS = {
  "deepseek-flash": {
    provider: "deepseek",
    model: "deepseek-flash",
    label: "DeepSeek Flash",
  },
  "gemini-3.5-flash-lite": {
    provider: "google",
    model: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash Lite",
  },
} as const;

export type AiModelId = keyof typeof AI_MODELS;

// El que aparece elegido al abrir la pagina y el que se usa si llega un id
// desconocido. Cambiar de modelo por defecto es cambiar esta linea.
export const DEFAULT_AI_MODEL_ID: AiModelId = "deepseek-flash";

export const AI_MODEL_IDS = Object.keys(AI_MODELS) as AiModelId[];

export const isAiModelId = (value: unknown): value is AiModelId =>
  typeof value === "string" && Object.hasOwn(AI_MODELS, value);

// Para la tabla: un pago guardado con un modelo que ya salio del catalogo
// sigue mostrando su id tal cual.
export const aiModelLabel = (id: string): string =>
  isAiModelId(id) ? AI_MODELS[id].label : id;
