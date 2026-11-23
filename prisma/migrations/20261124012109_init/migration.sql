-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('YAPE', 'PLIN');

-- CreateEnum
CREATE TYPE "PaymentDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "operationCode" TEXT NOT NULL,
    "source" "PaymentSource" NOT NULL,
    "direction" "PaymentDirection" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "operatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_source_operationCode_key" ON "Payment"("source", "operationCode");
