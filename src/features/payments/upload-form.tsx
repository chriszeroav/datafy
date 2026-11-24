"use client";

import { ImageUp, Loader2, ShieldCheck, TriangleAlert, X } from "lucide-react";
import type { DragEvent } from "react";
import { useActionState, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadScreenshot } from "./upload-action";
import {
  ACCEPTED_MIME_TYPES,
  formatAmount,
  formatBytes,
  formatOperatedAt,
  MAX_FILE_SIZE_BYTES,
} from "./upload-config";
import { INITIAL_UPLOAD_RESULT } from "./upload-result";

type Preview = { url: string; name: string };

export const UploadForm = () => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [state, formAction, isPending] = useActionState(
    uploadScreenshot,
    INITIAL_UPLOAD_RESULT,
  );

  // Las URL de objeto ocupan memoria hasta que se revocan a mano.
  const showPreview = (file: File) => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview({ url: URL.createObjectURL(file), name: file.name });
  };

  const clearPreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

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
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 size-72 rounded-full bg-violet-600/30 blur-3xl sm:size-[28rem]" />
        <div className="absolute -right-24 -bottom-32 size-72 rounded-full bg-emerald-500/25 blur-3xl sm:size-[28rem]" />
      </div>

      <div className="w-full max-w-xl">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            La imagen no se guarda en ningun lado
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Datafy
          </h1>
          <p className="mt-2 text-sm text-pretty text-muted-foreground sm:text-base">
            Sube una constancia de Yape o Plin y extrae sus datos.
          </p>
        </header>

        <Card className="border-border/60 bg-card/70 shadow-xl backdrop-blur">
          <CardContent className="p-4 sm:p-6">
            <form action={formAction} className="space-y-4">
              <label
                htmlFor={inputId}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors focus-within:ring-2 focus-within:ring-ring sm:min-h-56 ${
                  isDragging
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-border hover:border-violet-500/60 hover:bg-muted/40"
                }`}
              >
                {preview ? (
                  // biome-ignore lint/performance/noImgElement: la vista previa es una URL blob: local y next/image no puede optimizarla
                  <img
                    src={preview.url}
                    alt="Vista previa de la captura elegida"
                    className="max-h-48 w-auto rounded-lg border border-border object-contain shadow-sm sm:max-h-64"
                  />
                ) : (
                  <>
                    <span className="flex size-12 items-center justify-center rounded-full bg-violet-500/15 text-violet-500">
                      <ImageUp className="size-6" />
                    </span>
                    <span className="text-sm font-medium">
                      Arrastra la captura o toca para elegirla
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPEG o WebP, hasta {formatBytes(MAX_FILE_SIZE_BYTES)}
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
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2">
                  <span className="truncate text-sm">{preview.name}</span>
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

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Leyendo la imagen
                  </>
                ) : (
                  "Enviar captura"
                )}
              </Button>
            </form>

            <div aria-live="polite">
              {state.status === "error" && (
                <p className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  {state.message}
                </p>
              )}

              {state.status === "success" && (
                <section className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-3xl font-bold tracking-tight">
                      {formatAmount(state.payment.amount)}
                    </p>
                    <div className="flex gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          state.payment.direction === "INCOMING"
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {state.payment.direction === "INCOMING"
                          ? "Ingreso"
                          : "Egreso"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          state.payment.source === "YAPE"
                            ? "bg-violet-500/20 text-violet-700 dark:text-violet-300"
                            : "bg-teal-500/20 text-teal-700 dark:text-teal-300"
                        }`}
                      >
                        {state.payment.source}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 border-t border-emerald-500/20 pt-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">
                        Codigo de operacion
                      </dt>
                      <dd className="truncate font-mono text-sm font-medium">
                        {state.payment.operationCode}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">
                        Fecha de la operacion
                      </dt>
                      <dd className="text-sm font-medium">
                        {formatOperatedAt(state.payment.operatedAt)}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-3 truncate text-xs text-muted-foreground">
                    {state.fileName} · {formatBytes(state.sizeBytes)} ·{" "}
                    {state.tokens} tokens
                  </p>
                </section>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Paso 5 de 8, los datos todavia no se guardan
        </p>
      </div>
    </main>
  );
};
