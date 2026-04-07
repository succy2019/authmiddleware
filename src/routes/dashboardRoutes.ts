import { Hono } from "hono";
import type { Bindings } from "../type/types";
import { sessionAuth } from "../middleware/sessionAuth";
import { getStats, regenerateKey } from "../controller/dashboardController";

const dashboardRoutes = new Hono<{ Bindings: Bindings }>();

dashboardRoutes.use("*", sessionAuth);

dashboardRoutes.get("/stats", getStats);
dashboardRoutes.post("/regenerate-key", regenerateKey);

export default dashboardRoutes;
