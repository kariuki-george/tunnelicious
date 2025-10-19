/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `tunnels` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tunnels_userId_name_key" ON "tunnels"("userId", "name");
