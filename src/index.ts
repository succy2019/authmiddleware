import { Hono } from "hono";
import type { Bindings, Variables } from "./type/types";
import developerRoutes from "./routes/developerRoutes";
import tokenRoutes from "./routes/tokenRoutes";
import otpRoutes from "./routes/otpRoutes";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Health check
app.get("/", (c) => {
  return c.json({ message: "Auth Middleware Service is running" });
});

// Mount routes
app.route("/developers", developerRoutes);
app.route("/tokens", tokenRoutes);
app.route("/otp", otpRoutes);

export default app;
