// import { PrismaClient } from "@prisma/client";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/.prisma/generated/client";
import { env } from "@/env";

const connectionString = env.DATABASE_URL;

// Use neon postgres adapter in serverless env for performance reasons
// Only the local env will support the tcp based pg adapter.
// To enabled neon on local env, set DATABASE_DEV_USE_NEON to some value
// let adapter = null;

const adapter =  new PrismaNeon({ connectionString });


const prisma = new PrismaClient({ adapter });

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
