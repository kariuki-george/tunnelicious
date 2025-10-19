import { createAccessControl } from "better-auth/plugins/access";

export const statement = {} as const;

export const ac = createAccessControl(statement);
