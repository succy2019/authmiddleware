import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import type { Bindings, Variables } from "../type/types";

export const rateLimiter = cloudflareRateLimiter<{
  Bindings: Bindings;
  Variables: Variables;
}>({
  rateLimitBinding: (c) => c.env.RATE_LIMITER,
  keyGenerator: (c) => c.req.header("CF-Connecting-IP") ?? "unknown",
});
