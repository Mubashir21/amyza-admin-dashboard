// ===== lib/config.ts =====
// Single source of truth for all configuration

export const AUTH_CONFIG = {
  // Authorized emails for the student portfolio system
  AUTHORIZED_EMAILS: [
    "mubashirshoukat@gmail.com",
    "muzaffarrocks06@gmail.com",
    "mohammedshoukat@gmail.com",
    "mkloon12@gmail.com",
  ],

  //   // You can add other config here too
  //   APP_NAME: 'Student Portfolio System',
  //   MAX_STUDENTS_PER_BATCH: 30,
  //   ATTENDANCE_DAYS: [1, 3, 5], // Sunday, Tuesday, Thursday
};

// Helper functions
export const isAuthorizedEmail = (email: string): boolean => {
  return AUTH_CONFIG.AUTHORIZED_EMAILS.includes(email.toLowerCase());
};

export const getAuthorizedEmails = (): readonly string[] => {
  return AUTH_CONFIG.AUTHORIZED_EMAILS;
};
