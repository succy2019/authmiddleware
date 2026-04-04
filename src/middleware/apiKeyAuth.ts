import { createMiddleware } from "hono/factory";
import type { Bindings, Variables } from "../type/types";
import { getDeveloperByApiKey } from "../respository/repository";

export const apiKeyAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: Variables;
}>(async (c, next) => {
  const apiKey = c.req.header("X-API-Key");

  if (!apiKey) {
    return c.json({ error: "Missing X-API-Key header" }, 401);
  }

  const developer = await getDeveloperByApiKey(c.env.DB, apiKey);

  if (!developer) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  c.set("developer", developer);
  await next();
});
