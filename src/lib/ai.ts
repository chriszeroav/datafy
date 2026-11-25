import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import {
  AI_MODELS,
  type AiModelId,
  DEFAULT_AI_MODEL_ID,
  isAiModelId,
} from "./ai-models";

// Unico punto de acceso al modelo. El resto del codigo llama a getModel() y no
// sabe que proveedor hay detras. Los modelos elegibles estan en ai-models.ts;
// aqui solo se sabe como construir cada proveedor con su clave.

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable ${name} en el archivo .env`);
  }
  return value;
};

// Para agregar Claude mas adelante basta una entrada aqui y otra en el catalogo.
const providers = {
  deepseek: (model: string): LanguageModel =>
    createDeepSeek({ apiKey: requireEnv("DEEPSEEK_API_KEY") })(model),
  google: (model: string): LanguageModel =>
    createGoogleGenerativeAI({
      apiKey: requireEnv("GOOGLE_GENERATIVE_AI_API_KEY"),
    })(model),
};

// Lo que llega del formulario no es de fiar: un id desconocido cae al modelo
// por defecto en lugar de llegar al proveedor.
export const resolveModelId = (requested: unknown): AiModelId =>
  isAiModelId(requested) ? requested : DEFAULT_AI_MODEL_ID;

export const getModel = (id: AiModelId): LanguageModel => {
  const { provider, model } = AI_MODELS[id];
  return providers[provider](model);
};
