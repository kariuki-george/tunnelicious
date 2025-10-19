import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const createContext = async () => {
  return {
    auth: await auth.api.getSession({
      headers: await headers(),
    }),
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;
