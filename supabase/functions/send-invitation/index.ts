// Supabase Edge Function for sending invitation emails
// Deploy this to Supabase using: supabase functions deploy send-invitation
//
// Note: TypeScript errors in this file are expected - this is a Deno file, not Node.js
// The linter doesn't understand Deno types, but the function works when deployed

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { recipientEmail, inviterName, role, invitationLink } = await req.json();

    // Validate required fields
    if (!recipientEmail || !inviterName || !role || !invitationLink) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // HTML email template - matching website design
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Amyza Admin Dashboard</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Header with purple gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; letter-spacing: -0.02em;">
                You're Invited! 🎉
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Amyza Admin Dashboard
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                Hi there,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                <strong style="color: #8B5CF6;">${inviterName}</strong> has invited you to join the <strong>Amyza Admin Dashboard</strong> with <strong style="color: #8B5CF6;">${role === 'admin' ? 'Admin' : 'Viewer'}</strong> access.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${invitationLink}" 
                       style="display: inline-block; background: #8B5CF6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3); transition: all 0.2s;">
                      Create Your Account →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning box -->
              <table role="presentation" style="width: 100%; margin: 24px 0; background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #92400E; font-size: 14px;">
                      <strong>⏰ Important:</strong> This invitation expires in 7 days
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Role info -->
              <table role="presentation" style="width: 100%; margin: 24px 0; background: #F3F4F6; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937; font-size: 14px;">
                      Your Access Level: ${role === 'admin' ? '👤 Admin' : '👁️ Viewer'}
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      ${role === 'admin' ? 'You can manage students, mark attendance, view batches, and access rankings.' : 'You have read-only access to view students, attendance, batches, and rankings.'}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                If you have any questions, please contact your administrator.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #F9FAFB; padding: 32px 40px; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-align: center;">
                Best regards,<br>
                <strong style="color: #1f2937;">Amyza Admin Team</strong>
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Footer text -->
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
          © ${new Date().getFullYear()} Amyza Admin Dashboard. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textBody = `
🎉 You're Invited to Amyza Admin Dashboard!

Hi there,

${inviterName} has invited you to join the Amyza Admin Dashboard with ${role === 'admin' ? 'Admin' : 'Viewer'} access.

Create your account:
${invitationLink}

⏰ IMPORTANT: This invitation expires in 7 days

Your Access Level: ${role === 'admin' ? 'Admin' : 'Viewer'}
${role === 'admin' ? 'You can manage students, mark attendance, view batches, and access rankings.' : 'You have read-only access to view students, attendance, batches, and rankings.'}

If you have any questions, please contact your administrator.

Best regards,
Amyza Admin Team

---
© ${new Date().getFullYear()} Amyza Admin Dashboard. All rights reserved.

If you didn't expect this invitation, you can safely ignore this email.
    `;

    // Send email using Resend
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Amyza Admin <no-reply@amyzaportal.xyz>',
          to: [recipientEmail],
          subject: "You've been invited to Amyza Admin Dashboard",
          html: htmlBody,
          text: textBody,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error('Resend API error:', error);
        throw new Error('Failed to send email via Resend');
      }

      const resendData = await resendResponse.json();
      console.log('Email sent successfully:', resendData);

      return new Response(
        JSON.stringify({
          success: true,
          messageId: resendData.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      // Fallback: Just log the email (for development)
      console.log('Email would be sent to:', recipientEmail);
      console.log('Email content:', textBody);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email logged (no RESEND_API_KEY configured)',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-invitation function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
