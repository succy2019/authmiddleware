import type { Developer, Token, Otp } from "../type/types";

async function hashValue(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateOpaqueToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateApiKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return "ak_" + Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- Developer Repository ---

export async function createDeveloper(
  db: D1Database,
  name: string,
  email: string
): Promise<Developer & { raw_api_key: string }> {
  const id = generateId();
  const raw_api_key = generateApiKey();
  const hashed_api_key = await hashValue(raw_api_key);

  await db
    .prepare(
      "INSERT INTO developers (id, name, email, api_key) VALUES (?, ?, ?, ?)"
    )
    .bind(id, name, email, hashed_api_key)
    .run();

  const developer = await db
    .prepare("SELECT * FROM developers WHERE id = ?")
    .bind(id)
    .first<Developer>();

  return { ...developer!, raw_api_key };
}

export async function getDeveloperByApiKey(
  db: D1Database,
  apiKey: string
): Promise<Developer | null> {
  const hashedKey = await hashValue(apiKey);
  return db
    .prepare("SELECT * FROM developers WHERE api_key = ?")
    .bind(hashedKey)
    .first<Developer>();
}

export async function getDeveloperByEmail(
  db: D1Database,
  email: string
): Promise<Developer | null> {
  return db
    .prepare("SELECT * FROM developers WHERE email = ?")
    .bind(email)
    .first<Developer>();
}

export async function getDeveloperById(
  db: D1Database,
  id: string
): Promise<Developer | null> {
  return db
    .prepare("SELECT * FROM developers WHERE id = ?")
    .bind(id)
    .first<Developer>();
}

export async function regenerateApiKey(
  db: D1Database,
  developerId: string
): Promise<string> {
  const raw_api_key = generateApiKey();
  const hashed_api_key = await hashValue(raw_api_key);
  await db
    .prepare("UPDATE developers SET api_key = ? WHERE id = ?")
    .bind(hashed_api_key, developerId)
    .run();
  return raw_api_key;
}

export async function getDeveloperStats(
  db: D1Database,
  developerId: string
): Promise<{
  total_tokens: number;
  active_tokens: number;
  revoked_tokens: number;
  total_otps: number;
  verified_otps: number;
}> {
  const result = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM tokens WHERE developer_id = ?1) as total_tokens,
        (SELECT COUNT(*) FROM tokens WHERE developer_id = ?1 AND status = 'active' AND expires_at > datetime('now')) as active_tokens,
        (SELECT COUNT(*) FROM tokens WHERE developer_id = ?1 AND status = 'revoked') as revoked_tokens,
        (SELECT COUNT(*) FROM otps WHERE developer_id = ?1) as total_otps,
        (SELECT COUNT(*) FROM otps WHERE developer_id = ?1 AND status = 'verified') as verified_otps`
    )
    .bind(developerId)
    .first<{
      total_tokens: number;
      active_tokens: number;
      revoked_tokens: number;
      total_otps: number;
      verified_otps: number;
    }>();
  return result!;
}

// --- Token Repository ---

export async function issueToken(
  db: D1Database,
  developerId: string,
  expiresInSeconds: number = 3600
): Promise<Token & { raw_token: string }> {
  const id = generateId();
  const raw_token = generateOpaqueToken();
  const hashed_token = await hashValue(raw_token);
  const expiresAt = new Date(
    Date.now() + expiresInSeconds * 1000
  ).toISOString();

  await db
    .prepare(
      "INSERT INTO tokens (id, developer_id, token, status, expires_at) VALUES (?, ?, ?, 'active', ?)"
    )
    .bind(id, developerId, hashed_token, expiresAt)
    .run();

  const issued = await db
    .prepare("SELECT * FROM tokens WHERE id = ?")
    .bind(id)
    .first<Token>();

  return { ...issued!, raw_token };
}

export async function verifyToken(
  db: D1Database,
  developerId: string,
  token: string
): Promise<{ valid: boolean; reason?: string; token?: Token }> {
  const hashedToken = await hashValue(token);
  const row = await db
    .prepare(
      "SELECT * FROM tokens WHERE token = ? AND developer_id = ?"
    )
    .bind(hashedToken, developerId)
    .first<Token>();

  if (!row) {
    return { valid: false, reason: "Token not found" };
  }

  if (row.status === "revoked") {
    return { valid: false, reason: "Token has been revoked" };
  }

  if (new Date(row.expires_at) < new Date()) {
    return { valid: false, reason: "Token has expired" };
  }

  return { valid: true, token: row };
}

export async function revokeToken(
  db: D1Database,
  developerId: string,
  token: string
): Promise<boolean> {
  const hashedToken = await hashValue(token);
  const result = await db
    .prepare(
      "UPDATE tokens SET status = 'revoked' WHERE token = ? AND developer_id = ? AND status = 'active'"
    )
    .bind(hashedToken, developerId)
    .run();

  return result.meta.changes > 0;
}

// --- OTP Repository ---

function generateOtpCode(): string {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const num = ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]) % 1000000;
  return num.toString().padStart(6, "0");
}

export async function createOtp(
  db: D1Database,
  developerId: string,
  email: string,
  expiresInSeconds: number = 600
): Promise<Otp & { raw_otp_code: string }> {
  const id = generateId();
  const raw_otp_code = generateOtpCode();
  const hashed_otp_code = await hashValue(raw_otp_code);
  const expiresAt = new Date(
    Date.now() + expiresInSeconds * 1000
  ).toISOString();

  // Expire any existing pending OTPs for this email + developer
  await db
    .prepare(
      "UPDATE otps SET status = 'expired' WHERE email = ? AND developer_id = ? AND status = 'pending'"
    )
    .bind(email, developerId)
    .run();

  await db
    .prepare(
      "INSERT INTO otps (id, developer_id, email, otp_code, status, expires_at) VALUES (?, ?, ?, ?, 'pending', ?)"
    )
    .bind(id, developerId, email, hashed_otp_code, expiresAt)
    .run();

  const otp = await db
    .prepare("SELECT * FROM otps WHERE id = ?")
    .bind(id)
    .first<Otp>();

  return { ...otp!, raw_otp_code };
}

export async function verifyOtp(
  db: D1Database,
  developerId: string,
  email: string,
  otpCode: string
): Promise<{ valid: boolean; reason?: string }> {
  const hashedOtp = await hashValue(otpCode);
  const row = await db
    .prepare(
      "SELECT * FROM otps WHERE email = ? AND developer_id = ? AND otp_code = ? AND status = 'pending'"
    )
    .bind(email, developerId, hashedOtp)
    .first<Otp>();

  if (!row) {
    return { valid: false, reason: "Invalid OTP" };
  }

  if (new Date(row.expires_at) < new Date()) {
    await db
      .prepare("UPDATE otps SET status = 'expired' WHERE id = ?")
      .bind(row.id)
      .run();
    return { valid: false, reason: "OTP has expired" };
  }

  await db
    .prepare("UPDATE otps SET status = 'verified' WHERE id = ?")
    .bind(row.id)
    .run();

  return { valid: true };
}
