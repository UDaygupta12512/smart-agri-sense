import 'server-only';

import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const AUTH_SESSION_COOKIE = 'smartagri_session';
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const AUTH_SESSION_MAX_AGE_MS = AUTH_SESSION_MAX_AGE_SECONDS * 1000;
const AUTH_DB_PATH = path.join(process.cwd(), 'data', 'auth-db.json');

// Improved email regex - validates proper email format
// Requires: local part, @, domain with at least one dot, valid TLD (2+ chars)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// Rate limiting: track failed login attempts
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minute lockout

function checkRateLimit(email: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(email);

  if (!entry) {
    return;
  }

  // Check if still locked out
  if (entry.lockedUntil > now) {
    const remainingMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    throw new AuthError(
      `Too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`,
      429
    );
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(email);
  }
}

function recordFailedAttempt(email: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(email);

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(email, { attempts: 1, firstAttempt: now, lockedUntil: 0 });
    return;
  }

  entry.attempts += 1;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
}

function clearFailedAttempts(email: string): void {
  loginAttempts.delete(email);
}

// Password strength validation
function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password is too long (max 128 characters).' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  // Check for at least one digit
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password1', '12345678', 'qwerty12', 'admin123',
    'letmein1', 'welcome1', 'monkey12', 'dragon12', 'master12'
  ];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    return { valid: false, message: 'Password is too common. Please choose a stronger password.' };
  }

  return { valid: true, message: '' };
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  location: string;
  createdAt: string;
}

interface StoredSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface AuthDb {
  users: StoredUser[];
  sessions: StoredSession[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  location: string;
  createdAt: string;
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

const DEFAULT_DB: AuthDb = {
  users: [],
  sessions: [],
};

let dbLock: Promise<void> = Promise.resolve();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    location: user.location,
    createdAt: user.createdAt,
  };
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}

function coerceDb(raw: unknown): AuthDb {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_DB };
  }

  const parsed = raw as Partial<AuthDb>;
  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
  };
}

function purgeExpiredSessions(db: AuthDb): boolean {
  const now = Date.now();
  const nextSessions = db.sessions.filter((session) => new Date(session.expiresAt).getTime() > now);

  if (nextSessions.length === db.sessions.length) {
    return false;
  }

  db.sessions = nextSessions;
  return true;
}

async function readDb(): Promise<AuthDb> {
  try {
    const raw = await fs.readFile(AUTH_DB_PATH, 'utf8');
    return coerceDb(JSON.parse(raw));
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code === 'ENOENT') {
      await writeDb({ ...DEFAULT_DB });
      return { ...DEFAULT_DB };
    }
    throw error;
  }
}

async function writeDb(db: AuthDb): Promise<void> {
  await fs.mkdir(path.dirname(AUTH_DB_PATH), { recursive: true });

  const tempPath = `${AUTH_DB_PATH}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tempPath, AUTH_DB_PATH);
}

async function withDbLock<T>(operation: () => Promise<T>): Promise<T> {
  const previousLock = dbLock;
  let releaseLock: () => void = () => {};

  dbLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  await previousLock;

  try {
    return await operation();
  } finally {
    releaseLock();
  }
}

function validateRegistrationInput(input: {
  name: string;
  email: string;
  password: string;
  location?: string;
}): {
  name: string;
  email: string;
  password: string;
  location: string;
} {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;
  const location = (input.location ?? '').trim();

  if (!name) {
    throw new AuthError('Full name is required.', 400);
  }

  if (name.length > 80) {
    throw new AuthError('Full name is too long.', 400);
  }

  // Validate name contains only valid characters
  if (!/^[a-zA-Z\s\-'.]+$/.test(name) && !/^[\u0900-\u097F\s\-'.]+$/.test(name)) {
    // Allow Latin letters and common Indian scripts
    if (!/^[\p{L}\s\-'.]+$/u.test(name)) {
      throw new AuthError('Name contains invalid characters.', 400);
    }
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new AuthError('Please provide a valid email address.', 400);
  }

  // Validate password strength
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    throw new AuthError(passwordCheck.message, 400);
  }

  if (location.length > 120) {
    throw new AuthError('Location is too long.', 400);
  }

  return {
    name,
    email,
    password,
    location,
  };
}

function createSession(userId: string): StoredSession {
  const now = Date.now();
  return {
    token: crypto.randomBytes(32).toString('hex'),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + AUTH_SESSION_MAX_AGE_MS).toISOString(),
  };
}

export async function registerWithEmail(input: {
  name: string;
  email: string;
  password: string;
  location?: string;
}): Promise<{ user: AuthUser; sessionToken: string }> {
  const payload = validateRegistrationInput(input);

  return withDbLock(async () => {
    const db = await readDb();
    purgeExpiredSessions(db);

    const existingUser = db.users.find((user) => user.email === payload.email);
    if (existingUser) {
      throw new AuthError('An account with this email already exists.', 409);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const nowIso = new Date().toISOString();

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      passwordHash: hashPassword(payload.password, salt),
      passwordSalt: salt,
      location: payload.location,
      createdAt: nowIso,
    };

    const session = createSession(newUser.id);

    db.users.push(newUser);
    db.sessions.push(session);

    await writeDb(db);

    return {
      user: toPublicUser(newUser),
      sessionToken: session.token,
    };
  });
}

export async function loginWithEmail(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; sessionToken: string }> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!EMAIL_REGEX.test(email)) {
    throw new AuthError('Please provide a valid email address.', 400);
  }

  if (!password) {
    throw new AuthError('Password is required.', 400);
  }

  // Check rate limiting before attempting login
  checkRateLimit(email);

  return withDbLock(async () => {
    const db = await readDb();
    purgeExpiredSessions(db);

    const user = db.users.find((candidate) => candidate.email === email);
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      // Record failed attempt for rate limiting
      recordFailedAttempt(email);
      throw new AuthError('Invalid email or password.', 401);
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(email);

    const session = createSession(user.id);
    db.sessions.push(session);

    await writeDb(db);

    return {
      user: toPublicUser(user),
      sessionToken: session.token,
    };
  });
}

export async function getUserFromSession(sessionToken: string): Promise<AuthUser | null> {
  if (!sessionToken) {
    return null;
  }

  return withDbLock(async () => {
    const db = await readDb();
    let hasChanges = purgeExpiredSessions(db);

    const session = db.sessions.find((entry) => entry.token === sessionToken);
    if (!session) {
      if (hasChanges) {
        await writeDb(db);
      }
      return null;
    }

    const user = db.users.find((entry) => entry.id === session.userId);
    if (!user) {
      db.sessions = db.sessions.filter((entry) => entry.token !== sessionToken);
      hasChanges = true;
    }

    if (hasChanges) {
      await writeDb(db);
    }

    return user ? toPublicUser(user) : null;
  });
}

export async function logoutSession(sessionToken: string): Promise<void> {
  if (!sessionToken) {
    return;
  }

  await withDbLock(async () => {
    const db = await readDb();
    const nextSessions = db.sessions.filter((entry) => entry.token !== sessionToken);

    if (nextSessions.length !== db.sessions.length) {
      db.sessions = nextSessions;
      await writeDb(db);
    }
  });
}
