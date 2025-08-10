import { supabase } from "./supabase/client";
import { isAuthorizedEmail } from "./config";

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  // Check if email is authorized (client-side validation)
  if (!isAuthorizedEmail(email)) {
    throw new Error("Only authorized staff can register");
  }

  // Sign up with Supabase Auth - the trigger will create admin profile automatically
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) throw error;

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Check if user is authorized (has admin profile)
export async function checkAdminProfile(userId: string) {
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}
