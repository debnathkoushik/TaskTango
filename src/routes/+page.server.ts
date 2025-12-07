import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // If user is logged in, go to dashboard
  if (locals.session) {
    throw redirect(303, "/dashboard");
  }

  // Otherwise, go to login
  throw redirect(303, "/login");
};
