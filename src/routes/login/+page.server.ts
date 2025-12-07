import { redirect, fail } from "@sveltejs/kit";

export const actions = {
  default: async ({ request, locals }: { request: Request; locals: any }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    console.log("Login attempt for:", email);

    if (!email || !password) {
      return fail(400, { error: "Please fill in all fields" });
    }

    const { data, error } = await locals.supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    });

    if (error) {
      console.log("Login error:", error.message);
      return fail(400, { error: error.message });
    }

    console.log("Login successful for:", email);
    console.log("Session created:", !!data.session);

    // Redirect to dashboard
    throw redirect(303, "/dashboard");
  },
};
