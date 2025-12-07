import { createSupabaseServerClient } from "$lib/server/supabaseServer";

import type { RequestEvent } from "@sveltejs/kit";
import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      session: any; // Adjust the type as needed
      user: any; // Adjust the type as needed
    }
  }
}

export async function handle({
  event,
  resolve,
}: {
  event: RequestEvent;
  resolve: (event: RequestEvent, options?: any) => Promise<any>;
}) {
  console.log("Hook running for:", event.url.pathname);

  event.locals.supabase = createSupabaseServerClient(event);

  const {
    data: { session },
  } = await event.locals.supabase.auth.getSession();

  // ADD THESE DEBUG LOGS
  console.log("Session exists?", !!session);
  if (session) {
    console.log("User email:", session.user.email);
  }

  event.locals.session = session;
  event.locals.user = session?.user ?? null;

  return resolve(event, {
    filterSerializedResponseHeaders(name: string) {
      return name === "content-range";
    },
  });
}
