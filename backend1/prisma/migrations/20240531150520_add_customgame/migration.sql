/*
  Warnings:

  - You are about to drop the `CustomGame` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CustomGame";

-- CreateTable
CREATE TABLE "Custom" (
    "id" TEXT NOT NULL,
    "player" TEXT NOT NULL,

    CONSTRAINT "Custom_pkey" PRIMARY KEY ("id")
);
