/**
 * Email Services
 * Handles sending invitation emails via Supabase Edge Functions
 */

import { supabase } from "./supabase/client";

interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send invitation email via Supabase Edge Function
 */
export async function sendInvitationEmail(
  recipientEmail: string,
  inviterName: string,
  role: 'admin' | 'viewer',
  invitationLink: string
): Promise<EmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-invitation', {
      body: {
        recipientEmail,
        inviterName,
        role,
        invitationLink,
      },
    });

    if (error) {
      console.warn("Edge Function error (not deployed or misconfigured):", error);
      return { success: false, error: error.message || "Edge Function not available" };
    }

    console.log("Invitation email sent successfully:", data);
    return { success: true };
  } catch (error) {
    console.warn("Email service unavailable (Edge Function not deployed):", error);
    const errorMessage = error instanceof Error ? error.message : "Email service unavailable";
    return { success: false, error: errorMessage };
  }
}

/**
 * Fallback: Log email details to console (for development)
 */
export function logInvitationEmail(
  recipientEmail: string,
  inviterName: string,
  role: 'admin' | 'viewer',
  invitationLink: string
): void {
  console.log("%c" + "═".repeat(70), "color: #8B5CF6; font-weight: bold");
  console.log("%c🎉 INVITATION EMAIL (Development Mode)", "color: #8B5CF6; font-size: 16px; font-weight: bold");
  console.log("%c" + "═".repeat(70), "color: #8B5CF6; font-weight: bold");
  
  console.log(`%cTo: %c${recipientEmail}`, "color: #6b7280", "color: #1f2937; font-weight: bold");
  console.log(`%cFrom: %c${inviterName}`, "color: #6b7280", "color: #1f2937; font-weight: bold");
  console.log(`%cRole: %c${role === 'admin' ? '👤 Admin' : '👁️ Viewer'}`, "color: #6b7280", "color: #8B5CF6; font-weight: bold");
  
  console.log("%c" + "─".repeat(70), "color: #e5e7eb");
  console.log(`%c🔗 Invitation Link:`, "color: #6b7280; font-weight: bold");
  console.log(`%c${invitationLink}`, "color: #8B5CF6; text-decoration: underline");
  console.log("%c" + "─".repeat(70), "color: #e5e7eb");
  
  console.log("\n%cEmail Preview:", "color: #1f2937; font-weight: bold; font-size: 14px");
  console.log(`
%cSubject: 🎉 You're Invited to Amyza Admin Dashboard

%cHi there,

${inviterName} has invited you to join the Amyza Admin Dashboard with ${role === 'admin' ? 'Admin' : 'Viewer'} access.

%c⏰ This invitation expires in 7 days

%cYour Access: ${role === 'admin' ? '👤 Admin' : '👁️ Viewer'}
${role === 'admin' ? 
  'You can manage students, mark attendance, view batches, and access rankings.' : 
  'You have read-only access to view students, attendance, batches, and rankings.'}

Best regards,
Amyza Admin Team
  `, "color: #1f2937", "color: #1f2937; line-height: 1.6", "color: #F59E0B; font-weight: bold", "color: #6b7280");
  
  console.log("%c" + "═".repeat(70), "color: #8B5CF6; font-weight: bold");
}

