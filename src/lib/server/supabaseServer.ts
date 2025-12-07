import { createServerClient } from "@supabase/ssr";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} from "$env/static/public";

export function createSupabaseServerClient(event: any) {
  return createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        get: (key) => {
          const cookie = event.cookies.get(key);
          console.log(`Getting cookie: ${key} = ${cookie ? "exists" : "null"}`);
          return cookie;
        },
        set: (key, value, options) => {
          console.log(`Setting cookie: ${key}`);
          event.cookies.set(key, value, {
            ...options,
            path: "/",
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: "lax",
          });
        },
        remove: (key, options) => {
          console.log(`Removing cookie: ${key}`);
          event.cookies.delete(key, {
            ...options,
            path: "/",
          });
        },
      },
    }
  );
}
