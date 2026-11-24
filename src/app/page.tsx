import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import {
  PaymentList,
  PaymentListSkeleton,
} from "@/features/payments/payment-list";
import { UploadForm } from "@/features/payments/upload-form";

// La logica vive en features/: la pagina solo compone y decide el layout.
const HomePage = () => (
  <main className="relative min-h-dvh overflow-hidden px-4 py-10 sm:px-6">
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-32 -left-24 size-72 rounded-full bg-violet-600/30 blur-3xl sm:size-[28rem]" />
      <div className="absolute -right-24 -bottom-32 size-72 rounded-full bg-emerald-500/25 blur-3xl sm:size-[28rem]" />
    </div>

    <div className="mx-auto w-full max-w-xl">
      <header className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          La imagen no se guarda, solo sus datos
        </span>
        <h1 className="mt-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          Datafy
        </h1>
        <p className="mt-2 text-sm text-pretty text-muted-foreground sm:text-base">
          Sube una constancia de Yape o Plin y extrae sus datos.
        </p>
      </header>

      <UploadForm />

      <h2 className="mt-10 mb-3 text-sm font-medium text-muted-foreground">
        Pagos registrados
      </h2>

      {/* Sin "use cache": la lista se lee fresca en cada peticion y el shell
          prerenderizado muestra el esqueleto mientras llega. */}
      <Suspense fallback={<PaymentListSkeleton />}>
        <PaymentList />
      </Suspense>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Paso 6 de 8, faltan las validaciones y los evals
      </p>
    </div>
  </main>
);

export default HomePage;
