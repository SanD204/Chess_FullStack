-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Move" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameId" TEXT NOT NULL,
    "player" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Move" ADD CONSTRAINT "Move_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
