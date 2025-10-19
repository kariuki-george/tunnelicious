import {  passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";


const auth = createAuthClient({
  plugins: [
    passkeyClient(),
   
  ],
});

export const { signIn, signOut, useSession } = auth;

export default auth;
