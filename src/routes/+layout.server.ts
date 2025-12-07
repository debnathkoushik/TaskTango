// FILE: src/routes/+layout.server.ts
// Root layout server - passes session to client

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    session: locals.session,
    user: locals.user,
  };
};
