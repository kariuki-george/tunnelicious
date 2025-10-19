// src/server/routers/tunnel.ts
import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import prisma from "@/lib/prisma";
import { InternalError, wrapErrors } from "../../core/errors";

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
