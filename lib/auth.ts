import { supabase } from "./supabase/client";
import { validateInvitationToken, markInvitationAsUsed } from "./invite-services";

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  inviteToken?: string
) {
  // Validate invitation token
  if (!inviteToken) {
    throw new Error("You need a valid invitation to sign up. Please contact your administrator.");
  }

  const invitation = await validateInvitationToken(inviteToken);
  
  if (!invitation) {
    throw new Error("Invalid or expired invitation. Please contact your administrator.");
  }

  if (invitation.email.toLowerCase() !== email.toLowerCase()) {
    throw new Error("This invitation was sent to a different email address.");
  }

  // Sign up with Supabase Auth - the trigger will create admin profile automatically
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        invited_role: invitation.role, // Store intended role in user metadata
      },
    },
  });

  if (error) throw error;

  // Mark invitation as used
  if (data.user) {
    try {
      await markInvitationAsUsed(invitation.id, data.user.id);
    } catch (inviteError) {
      console.error("Error marking invitation as used:", inviteError);
      // Don't fail signup if we can't mark invitation as used
    }
  }

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
