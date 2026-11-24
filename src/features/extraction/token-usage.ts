// Desglose normalizado del consumo de una llamada al modelo. Vive aparte del
// SDK para que el cliente pueda usarlo sin arrastrar nada del servidor.
export type TokenUsage = {
  input: number;
  // Parte de la entrada que se sirvio de cache y por tanto cuesta menos.
  cachedInput: number;
  output: number;
  // Razonamiento interno: se factura aunque nunca aparezca en la respuesta.
  reasoning: number;
  total: number;
};

export const sumTokenUsage = (entries: readonly TokenUsage[]): TokenUsage =>
  entries.reduce<TokenUsage>(
    (acc, entry) => ({
      input: acc.input + entry.input,
      cachedInput: acc.cachedInput + entry.cachedInput,
      output: acc.output + entry.output,
      reasoning: acc.reasoning + entry.reasoning,
      total: acc.total + entry.total,
    }),
    { input: 0, cachedInput: 0, output: 0, reasoning: 0, total: 0 },
  );
