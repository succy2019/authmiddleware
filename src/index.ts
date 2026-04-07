import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Bindings, Variables } from "./type/types";
import { rateLimiter } from "./middleware/rateLimiter";
import developerRoutes from "./routes/developerRoutes";
import tokenRoutes from "./routes/tokenRoutes";
import otpRoutes from "./routes/otpRoutes";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  })
);

// Rate limiting
app.use(rateLimiter);

// Health check
app.get("/api/health", (c) => {
  return c.json({ message: "Auth Middleware Service is running" });
});

// Mount routes
app.route("/auth", authRoutes);
app.route("/dashboard", dashboardRoutes);
app.route("/developers", developerRoutes);
app.route("/tokens", tokenRoutes);
app.route("/otp", otpRoutes);

// Serve static assets + SPA fallback
app.get("*", async (c) => {
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status !== 404) return res;
  return c.env.ASSETS.fetch(new Request(new URL("/index.html", c.req.url)));
});

export default app;
