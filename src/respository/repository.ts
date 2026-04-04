import type { Developer, Token } from "../type/types";

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
): Promise<Developer> {
  const id = generateId();
  const api_key = generateApiKey();

  await db
    .prepare(
      "INSERT INTO developers (id, name, email, api_key) VALUES (?, ?, ?, ?)"
    )
    .bind(id, name, email, api_key)
    .run();

  const developer = await db
    .prepare("SELECT * FROM developers WHERE id = ?")
    .bind(id)
    .first<Developer>();

  return developer!;
}

export async function getDeveloperByApiKey(
  db: D1Database,
  apiKey: string
): Promise<Developer | null> {
  return db
    .prepare("SELECT * FROM developers WHERE api_key = ?")
    .bind(apiKey)
    .first<Developer>();
}

// --- Token Repository ---

export async function issueToken(
  db: D1Database,
  developerId: string,
  userIdentifier: string,
  expiresInSeconds: number = 3600
): Promise<Token> {
  const id = generateId();
  const token = generateOpaqueToken();
  const expiresAt = new Date(
    Date.now() + expiresInSeconds * 1000
  ).toISOString();

  await db
    .prepare(
      "INSERT INTO tokens (id, developer_id, token, user_identifier, status, expires_at) VALUES (?, ?, ?, ?, 'active', ?)"
    )
    .bind(id, developerId, token, userIdentifier, expiresAt)
    .run();

  const issued = await db
    .prepare("SELECT * FROM tokens WHERE id = ?")
    .bind(id)
    .first<Token>();

  return issued!;
}

export async function verifyToken(
  db: D1Database,
  developerId: string,
  token: string
): Promise<{ valid: boolean; reason?: string; token?: Token }> {
  const row = await db
    .prepare(
      "SELECT * FROM tokens WHERE token = ? AND developer_id = ?"
    )
    .bind(token, developerId)
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
  const result = await db
    .prepare(
      "UPDATE tokens SET status = 'revoked' WHERE token = ? AND developer_id = ? AND status = 'active'"
    )
    .bind(token, developerId)
    .run();

  return result.meta.changes > 0;
}
