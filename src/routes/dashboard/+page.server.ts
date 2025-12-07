import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  console.log("Dashboard +page.server.js running");
  console.log("Session in dashboard:", !!locals.session);
  console.log("User in dashboard:", locals.user?.email);

  if (!locals.session) {
    console.log("No session - redirecting to /login");
    throw redirect(303, "/login");
  }

  console.log("Session exists - allowing access");
  return {
    user: locals.user,
  };
};
