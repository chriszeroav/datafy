import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Por defecto es 1 MB y una captura de celular lo pasa sin esfuerzo.
      // Se deja holgado a proposito: el limite real lo aplica upload-config,
      // para que el error que ve el usuario sea el nuestro y no el del framework.
      bodySizeLimit: "8mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
