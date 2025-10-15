/**
 * Invitation Services
 * Handles creating, validating, and managing user invitations
 */

import { supabase } from "./supabase/client";
import { sendInvitationEmail, logInvitationEmail } from "./email-services";

export interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  token: string;
  invited_by: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
}

export interface InvitationWithInviter extends Invitation {
  inviter_name: string;
  inviter_email: string;
}

/**
 * Create a new invitation
 */
export async function createInvitation(
  email: string,
  role: 'admin' | 'viewer',
  invitedBy: string,
  inviterName: string
): Promise<{ invitation: Invitation; inviteLink: string }> {
  try {
    // Generate a unique token
    const token = crypto.randomUUID();
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from("invitations")
      .insert({
        email: email.toLowerCase(),
        role,
        token,
        invited_by: invitedBy,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating invitation:", error);
      throw new Error(`Failed to create invitation: ${error.message || error.code || 'Unknown database error'}`);
    }
    
    if (!data) {
      throw new Error("Failed to create invitation: No data returned");
    }

    const invitation = data as Invitation;
    
    // Generate invite link
    const inviteLink = `${window.location.origin}/signup?invite=${token}`;

    // Try to send email (will fallback to console if not configured)
    // Don't let email failures block the invitation creation
    try {
      const emailResult = await sendInvitationEmail(
        email,
        inviterName,
        role,
        inviteLink
      );

      // If email sending is not configured, log to console
      if (!emailResult.success) {
        console.warn("Email sending failed, logging to console instead");
        logInvitationEmail(email, inviterName, role, inviteLink);
      }
    } catch (emailError) {
      console.warn("Email service error (invitation still created):", emailError);
      logInvitationEmail(email, inviterName, role, inviteLink);
    }

    return { invitation, inviteLink };
  } catch (error) {
    // Better error logging
    console.error("Error creating invitation:", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name,
      email,
      role
    });
    
    // Throw a proper error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : 'Unknown error occurred';
    
    throw new Error(errorMessage);
  }
}

/**
 * Get all invitations with inviter details
 */
export async function getAllInvitations(): Promise<InvitationWithInviter[]> {
  try {
    // First, get all invitations
    const { data: invitations, error } = await supabase
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invitations:", error);
      throw error;
    }

    if (!invitations || invitations.length === 0) {
      return [];
    }

    // Get unique inviter IDs
    const inviterIds = [...new Set(invitations.map((inv) => inv.invited_by))];

    // Fetch inviter details from admins table
    const { data: inviters, error: invitersError } = await supabase
      .from("admins")
      .select("user_id, first_name, last_name, email")
      .in("user_id", inviterIds);

    if (invitersError) {
      console.error("Error fetching inviters:", invitersError);
      throw invitersError;
    }

    // Create a map of inviter details
    const inviterMap = new Map(
      inviters?.map((inviter) => [
        inviter.user_id,
        {
          name: `${inviter.first_name} ${inviter.last_name}`,
          email: inviter.email,
        },
      ])
    );

    // Combine invitations with inviter details
    const invitationsWithInviter: InvitationWithInviter[] = invitations.map(
      (invitation) => {
        const inviter = inviterMap.get(invitation.invited_by) || {
          name: "Unknown",
          email: "unknown@example.com",
        };
        return {
          ...invitation,
          inviter_name: inviter.name,
          inviter_email: inviter.email,
        } as InvitationWithInviter;
      }
    );

    return invitationsWithInviter;
  } catch (error) {
    console.error("Error in getAllInvitations:", error);
    throw error;
  }
}

/**
 * Validate an invitation token
 */
export async function validateInvitationToken(
  token: string
): Promise<Invitation | null> {
  try {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error) {
      console.error("Error validating invitation:", error);
      return null;
    }

    return data as Invitation;
  } catch (error) {
    console.error("Error in validateInvitationToken:", error);
    return null;
  }
}

/**
 * Mark invitation as used
 */
export async function markInvitationAsUsed(
  invitationId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from("invitations")
      .update({
        used: true,
        used_at: new Date().toISOString(),
        used_by: userId,
      })
      .eq("id", invitationId);

    if (error) {
      console.error("Error marking invitation as used:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in markInvitationAsUsed:", error);
    throw error;
  }
}

/**
 * Get invitation statistics
 */
export async function getInvitationStats(): Promise<{
  total: number;
  pending: number;
  used: number;
  expired: number;
}> {
  try {
    const { data: invitations, error } = await supabase
      .from("invitations")
      .select("used, expires_at");

    if (error) {
      console.error("Error getting invitation stats:", error);
      throw error;
    }

    if (!invitations) {
      return { total: 0, pending: 0, used: 0, expired: 0 };
    }

    const now = new Date().toISOString();
    const stats = {
      total: invitations.length,
      pending: 0,
      used: 0,
      expired: 0,
    };

    invitations.forEach((inv) => {
      if (inv.used) {
        stats.used++;
      } else if (inv.expires_at < now) {
        stats.expired++;
      } else {
        stats.pending++;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error in getInvitationStats:", error);
    throw error;
  }
}

/**
 * Revoke (delete) an invitation
 */
export async function revokeInvitation(invitationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", invitationId);

    if (error) throw error;
  } catch (error) {
    console.error("Error revoking invitation:", error);
    throw error;
  }
}

