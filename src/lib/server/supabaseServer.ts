import { createServerClient } from "@supabase/ssr";
import { env } from "$env/dynamic/public";

export function createSupabaseServerClient(event: any) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseKey = env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(supabaseUrl, supabaseKey, {
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
  });
}
