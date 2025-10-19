import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/app/server";
import { createContext } from "@/app/server/context";
import { env } from "@/env";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.log(
              `tRPC failed on ${path ?? "<no-path>"} : ${error.message}`,
            );
          }
        : undefined,
  });
};
export { handler as GET, handler as POST };
