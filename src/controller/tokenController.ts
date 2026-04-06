import type { Context } from "hono";
import {
  issueToken,
  verifyToken,
  revokeToken,
} from "../respository/repository";

export async function issue(c: Context) {
  const developer = c.get("developer");
  const body = await c.req.json<{
    expires_in?: number;
  }>();

  const token = await issueToken(
    c.env.DB,
    developer.id,
    body.expires_in
  );

  return c.json(
    {
      token: token.token,
      status: token.status,
      expires_at: token.expires_at,
      created_at: token.created_at,
    },
    201
  );
}

export async function verify(c: Context) {
  const developer = c.get("developer");
  const body = await c.req.json<{ token: string }>();

  if (!body.token) {
    return c.json({ error: "token is required" }, 400);
  }

  const result = await verifyToken(c.env.DB, developer.id, body.token);

  if (!result.valid) {
    return c.json({ valid: false, reason: result.reason }, 200);
  }

  return c.json({
    valid: true,
    expires_at: result.token!.expires_at,
  });
}

export async function revoke(c: Context) {
  const developer = c.get("developer");
  const body = await c.req.json<{ token: string }>();

  if (!body.token) {
    return c.json({ error: "token is required" }, 400);
  }

  const revoked = await revokeToken(c.env.DB, developer.id, body.token);

  if (!revoked) {
    return c.json({ error: "Token not found or already revoked" }, 404);
  }

  return c.json({ message: "Token revoked successfully" });
}
