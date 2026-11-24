import { generateText } from "ai";
import { getModel } from "@/lib/ai";

// Comprobacion del paso 4: confirma que la clave y el modelo responden.
// Es andamiaje temporal, se borra cuando la extraccion real este en marcha.
export const GET = async () => {
  try {
    const { text, usage } = await generateText({
      model: getModel(),
      prompt: "Responde unicamente con el nombre de la moneda de Peru.",
    });

    return Response.json({ ok: true, text, usage });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
};
