import { Hono } from "hono";
import type { Bindings, Variables } from "../type/types";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import { issue, verify, revoke } from "../controller/tokenController";

const tokenRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

tokenRoutes.use("*", apiKeyAuth);

tokenRoutes.post("/issue", issue);
tokenRoutes.post("/verify", verify);
tokenRoutes.post("/revoke", revoke);

export default tokenRoutes;
