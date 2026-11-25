-- AlterTable
-- Hasta esta migracion DeepSeek era el unico proveedor, asi que las filas que
-- ya existen se leyeron con el. El default solo sirve para rellenarlas: luego
-- se quita, y cada pago nuevo tiene que decir con que modelo se leyo.
ALTER TABLE "Payment" ADD COLUMN "model" TEXT NOT NULL DEFAULT 'deepseek-flash';
ALTER TABLE "Payment" ALTER COLUMN "model" DROP DEFAULT;
