import { tunnelRouter } from "./routers/tunnels/tunnels.router";
import { router } from "./trpc";

const appRouter = router({
    tunnels: tunnelRouter,
});

export type AppRouter = typeof appRouter;
export { appRouter };
