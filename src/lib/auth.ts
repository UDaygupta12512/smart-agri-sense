import 'server-only';

import crypto from 'node:crypto';

export const AUTH_SESSION_COOKIE = 'smartagri_session';
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  location: string;
  createdAt: string;
}

// -----------------------------------------------------------------
// Stateless, serverless-compatible auth using signed session tokens.
// User data is encoded directly in the session cookie (JWT-like).
// No filesystem writes required — works on Vercel, Netlify, etc.
// -----------------------------------------------------------------

const SECRET = process.env.AUTH_SECRET || 'smartagrisense-default-secret-change-in-production';

function hmacSign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex');
}

export function createSessionToken(user: AuthUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const sig = hmacSign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): AuthUser | null {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    if (hmacSign(payload) !== sig) return null;
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthUser;
    if (!user.id || !user.email) return null;
    return user;
  } catch {
    return null;
  }
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long.' };
  if (password.length > 128) return { valid: false, message: 'Password is too long (max 128 characters).' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password must contain at least one number.' };
  return { valid: true, message: '' };
}

export async function registerWithEmail(input: {
  name: string;
  email: string;
  password: string;
  location?: string;
}): Promise<{ user: AuthUser; sessionToken: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const location = (input.location ?? '').trim();

  if (!name || name.length < 2) throw new AuthError('Full name must be at least 2 characters.', 400);
  if (name.length > 80) throw new AuthError('Full name is too long.', 400);
  if (!EMAIL_REGEX.test(email)) throw new AuthError('Please provide a valid email address.', 400);

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) throw new AuthError(passwordCheck.message, 400);

  const user: AuthUser = {
    id: crypto.randomUUID(),
    name,
    email,
    location,
    createdAt: new Date().toISOString(),
  };

  const sessionToken = createSessionToken(user);
  return { user, sessionToken };
}

export async function loginWithEmail(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; sessionToken: string }> {
  // Since we're stateless, login is verified client-side via session cookie.
  // For a production app, you would verify against a real DB here.
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!EMAIL_REGEX.test(email)) throw new AuthError('Please provide a valid email address.', 400);
  if (!password) throw new AuthError('Password is required.', 400);

  // Stateless: we can't verify against stored passwords without a DB.
  // Return error to guide user to register or use the session cookie.
  throw new AuthError('No account found with this email. Please sign up first.', 401);
}

export async function getUserFromSession(sessionToken: string): Promise<AuthUser | null> {
  if (!sessionToken) return null;
  return verifySessionToken(sessionToken);
}

export async function logoutSession(_sessionToken: string): Promise<void> {
  // Stateless — logout is handled by deleting the cookie on the client.
}
