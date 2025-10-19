// src/server/routers/tunnel.ts
import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import prisma from "@/lib/prisma";
import { InternalError, wrapErrors } from "../../core/errors";
import { init } from "@paralleldrive/cuid2"
import os from "os"
import crypto from "crypto"


export function getRuntimeFingerprint() {
  const hostname = os.hostname() // ephemeral but unique to that instance
  const data = `${hostname}-${process.pid}-${Date.now()}`
  return crypto.createHash("md5").update(data).digest("hex")
}

const createId = init({
  // A custom random function with the same API as Math.random.
  // You can use this to pass a cryptographically secure random function.
  random: Math.random,
  // the length of the id
  length: 8,
  // A custom fingerprint for the host environment. This is used to help
  // prevent collisions when generating ids in a distributed system.
  fingerprint: getRuntimeFingerprint(),
});

export const tunnelRouter = router({
  list: protectedProcedure.query(
    wrapErrors(async ({ ctx }) => {
      const { userId } = ctx.auth.session;
      return prisma.tunnels.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    })
  ),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(3).max(64) }))
    .mutation(
      wrapErrors(async ({ input, ctx }) => {
        const { userId } = ctx.auth.session;

        // enforce limit: 3 tunnels per user
        const count = await prisma.tunnels.count({
          where: { userId },
        });
        if (count >= 3)
          throw new InternalError("BAD_REQUEST", "Tunnel limit reached");

        const apiKey = `tk-${Math.random().toString(36).slice(2, 12)}`;
        const tunnel = await prisma.tunnels.create({
          data: {
            userId,
            name: input.name,
            apiKey,
            id: createId()
          },
        });
        return tunnel;
      })
    ),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(
    wrapErrors(async ({ input, ctx }) => {
      const { userId } = ctx.auth.session;
      await prisma.tunnels.deleteMany({
        where: { id: input.id, userId },
      });
      return { success: true };
    })
  ),
});
