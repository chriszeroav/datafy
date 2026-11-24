import { Suspense } from "react";
import {
  PaymentsPanel,
  PaymentsPanelSkeleton,
} from "@/features/payments/payments-panel";
import { UploadForm } from "@/features/payments/upload-form";

// La logica vive en features/: la pagina solo compone y decide el layout.
const HomePage = () => (
  // El pb generoso evita que la burbuja flotante tape la ultima fila.
  <main className="relative min-h-dvh px-4 pt-10 pb-24 sm:px-6 lg:pt-16">
    {/* Papel rayado muy tenue, como el fondo de un talonario */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55] [background-image:repeating-linear-gradient(to_bottom,transparent_0px,transparent_31px,var(--border)_31px,var(--border)_32px)]"
    />

    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-dashed border-border pb-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter sm:text-6xl">
            Datafy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus constancias de Yape y Plin, convertidas en datos.
          </p>
        </div>

        {/* Sello de goma: el guiño que le da caracter a la cabecera */}
        <p className="-rotate-3 rounded-md border-2 border-yape/70 px-3 py-1.5 text-center text-[0.7rem] leading-tight font-bold tracking-[0.18em] text-yape/80 uppercase">
          Sin guardar
          <br />
          la imagen
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-8">
          <UploadForm />
        </div>

        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Constancias registradas
          </h2>
          {/* Sin "use cache": la lista se lee fresca en cada peticion y el
              shell prerenderizado muestra el esqueleto mientras llega. */}
          <Suspense fallback={<PaymentsPanelSkeleton />}>
            <PaymentsPanel />
          </Suspense>
        </section>
      </div>

      <p className="mt-12 text-center font-mono text-[0.7rem] tracking-wider text-muted-foreground uppercase">
        Paso 6 de 8 · faltan validaciones y evals
      </p>
    </div>
  </main>
);

export default HomePage;
