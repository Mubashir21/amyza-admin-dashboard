// ===== lib/config.ts =====
// Single source of truth for all configuration

/**
 * Authentication Configuration
 * Note: With the invitation system, these authorized emails are no longer strictly enforced
 * All users now go through the invitation flow with role-based access
 */
export const AUTH_CONFIG = {
  // Legacy: List of emails that were allowed before invitation system
  // Now handled by invitations table with role-based access (admin/viewer)
  AUTHORIZED_EMAILS: [] as readonly string[],
} as const;

// Helper functions (legacy - kept for backwards compatibility)
export const isAuthorizedEmail = (_email: string): boolean => {
  // With invitation system, authorization is handled by invitations table
  // This function is kept for backwards compatibility but always returns true
  return true;
};

export const getAuthorizedEmails = (): readonly string[] => {
  return AUTH_CONFIG.AUTHORIZED_EMAILS;
};
