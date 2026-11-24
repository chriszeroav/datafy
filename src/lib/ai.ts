import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";

// Unico punto de acceso al modelo. El resto del codigo llama a getModel() y no
// sabe que proveedor hay detras: cambiarlo se hace aqui y en el .env.

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable ${name} en el archivo .env`);
  }
  return value;
};

// Para agregar Claude mas adelante basta una entrada mas en este objeto.
const providers = {
  deepseek: (model: string): LanguageModel =>
    createDeepSeek({ apiKey: requireEnv("DEEPSEEK_API_KEY") })(model),
};

type ProviderName = keyof typeof providers;

const DEFAULT_MODEL: Record<ProviderName, string> = {
  deepseek: "deepseek-flash",
};

const isProviderName = (value: string): value is ProviderName =>
  Object.hasOwn(providers, value);

export const getModel = (): LanguageModel => {
  const provider = process.env.AI_PROVIDER ?? "deepseek";

  if (!isProviderName(provider)) {
    const known = Object.keys(providers).join(", ");
    throw new Error(
      `Proveedor de IA desconocido: "${provider}". Disponibles: ${known}.`,
    );
  }

  return providers[provider](process.env.AI_MODEL ?? DEFAULT_MODEL[provider]);
};
