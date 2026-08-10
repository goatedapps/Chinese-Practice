// Supabase Auth only has a first-class email/password identity, no
// "username" concept -- and this app deliberately doesn't want a real-email
// dependency (email confirmation friction is what motivated this). A typed
// username is deterministically mapped to a synthetic email under
// example.com (IANA-reserved for documentation/testing -- guaranteed no real
// mailbox exists there, so nothing bad happens even if Supabase ever tried
// to send mail to it). Requires "Confirm email" to be turned OFF in the
// Supabase project (Authentication -> Providers -> Email) -- a synthetic
// address can never receive a confirmation link, so signups would otherwise
// be permanently stuck unconfirmed.
const FAKE_EMAIL_DOMAIN = "example.com";
const USERNAME_PATTERN = /^[a-z0-9_-]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function usernameToEmail(username: string): string {
  return `${username}@${FAKE_EMAIL_DOMAIN}`;
}

// Inverse of usernameToEmail -- used to recover a display-friendly username
// from the session's synthetic email (session.user.email), since Supabase
// only ever hands back the email side of the mapping.
export function emailToUsername(email: string): string {
  return email.split("@")[0];
}
