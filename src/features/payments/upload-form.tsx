"use client";

import { CheckCircle2, ImageUp, Loader2, TriangleAlert, X } from "lucide-react";
import type { DragEvent } from "react";
import {
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import type { TokenUsage } from "@/features/extraction/token-usage";
import { Ticket, TicketPerforation } from "./ticket";
import { TokenMeter } from "./token-meter";
import { uploadScreenshot } from "./upload-action";
import {
  ACCEPTED_MIME_TYPES,
  formatAmount,
  formatBytes,
  MAX_FILE_SIZE_BYTES,
} from "./upload-config";
import { type ExtractedPayment, INITIAL_UPLOAD_RESULT } from "./upload-result";

type Preview = { url: string; name: string };

// Resumen de una linea: el detalle completo ya aparece en la tabla.
const PaymentSummary = ({ payment }: { payment: ExtractedPayment }) => (
  <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 pl-6">
    <span className="font-mono font-semibold tabular-nums">
      {payment.direction === "INCOMING" ? "+" : "-"}
      {formatAmount(payment.amount)}
    </span>
    <span className="font-mono text-xs text-muted-foreground">
      {payment.source} · {payment.operationCode}
    </span>
  </p>
);

export const UploadForm = () => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useRef<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [state, formAction, isPending] = useActionState(
    uploadScreenshot,
    INITIAL_UPLOAD_RESULT,
  );
  const [usageHistory, setUsageHistory] = useState<TokenUsage[]>([]);
  const countedResult = useRef<typeof state | null>(null);

  // Las URL de objeto ocupan memoria hasta que se revocan a mano, por eso la
  // ultima se guarda en una ref y no solo en el estado.
  const showPreview = (file: File) => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const url = URL.createObjectURL(file);
    previewUrl.current = url;
    setPreview({ url, name: file.name });
  };

  const clearPreview = useCallback(() => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  // useActionState devuelve un objeto nuevo por cada resultado, asi que basta
  // comparar identidades para procesar cada llamada una sola vez. Sin esto el
  // modo estricto de React, que ejecuta los efectos dos veces en desarrollo,
  // duplicaria justamente la medicion que queremos leer.
  useEffect(() => {
    if (countedResult.current === state) return;
    countedResult.current = state;

    if (state.status === "success" || state.status === "duplicate") {
      setUsageHistory((history) => [...history, state.usage]);
    }

    // Tras guardar, el formulario queda listo para la siguiente captura.
    if (state.status === "success") clearPreview();
  }, [state, clearPreview]);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file || !inputRef.current) return;
    // Se vuelca en el input nativo para que el formulario lo envie igual que
    // si lo hubieras elegido con el dialogo del sistema.
    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    showPreview(file);
  };

  return (
    <>
      <Ticket className="px-4 pt-4 pb-5 sm:px-5">
        <p className="font-mono text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase">
          Nueva constancia
        </p>
        <TicketPerforation />

        <form action={formAction} className="space-y-3">
          <label
            htmlFor={inputId}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-5 text-center transition-colors focus-within:ring-2 focus-within:ring-ring ${
              isDragging
                ? "border-yape bg-yape/10"
                : "border-border hover:border-yape/50 hover:bg-muted/60"
            }`}
          >
            {preview ? (
              // biome-ignore lint/performance/noImgElement: la vista previa es una URL blob: local y next/image no puede optimizarla
              <img
                src={preview.url}
                alt="Vista previa de la captura elegida"
                className="max-h-56 w-auto rounded-lg border border-border object-contain shadow-sm"
              />
            ) : (
              <>
                <span className="flex size-12 items-center justify-center rounded-full bg-yape/12 text-yape">
                  <ImageUp className="size-6" />
                </span>
                <span className="text-sm font-medium">
                  Arrastra la captura o toca para elegirla
                </span>
                <span className="font-mono text-[0.7rem] text-muted-foreground">
                  PNG · JPEG · WEBP · max {formatBytes(MAX_FILE_SIZE_BYTES)}
                </span>
              </>
            )}
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              name="file"
              accept={ACCEPTED_MIME_TYPES.join(",")}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) showPreview(file);
              }}
            />
          </label>

          {preview && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-1.5">
              <span className="truncate font-mono text-xs">{preview.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearPreview}
              >
                <X className="size-4" />
                Quitar
              </Button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full tracking-wide"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Leyendo la captura
              </>
            ) : (
              "Extraer datos"
            )}
          </Button>
        </form>

        <div aria-live="polite">
          {state.status === "error" && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {state.message}
            </p>
          )}

          {state.status === "duplicate" && (
            <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <p className="flex items-start gap-2 font-medium text-amber-700 dark:text-amber-400">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                Ya estaba registrada
              </p>
              <PaymentSummary payment={state.payment} />
            </div>
          )}

          {state.status === "success" && (
            <div className="mt-3 rounded-lg border border-plin/40 bg-plin/10 p-3 text-sm">
              <p className="flex items-start gap-2 font-medium text-plin">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                Guardado
              </p>
              <PaymentSummary payment={state.payment} />
            </div>
          )}
        </div>
      </Ticket>

      <TokenMeter history={usageHistory} />
    </>
  );
};
