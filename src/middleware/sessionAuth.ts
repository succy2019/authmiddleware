import { createMiddleware } from "hono/factory";
import type { Bindings } from "../type/types";
import { verifySessionToken } from "../utils/session";
import { getDeveloperById } from "../respository/repository";

export const sessionAuth = createMiddleware<{
  Bindings: Bindings;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice(7);
  const developerId = await verifySessionToken(token, c.env.SESSION_SECRET);

  if (!developerId) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  const developer = await getDeveloperById(c.env.DB, developerId);
  if (!developer) {
    return c.json({ error: "Developer not found" }, 401);
  }

  c.set("developerId", developerId);
  c.set("developer", developer);
  await next();
});
