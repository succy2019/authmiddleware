import { Hono } from "hono";
import type { Bindings, Variables } from "../type/types";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import { sendOtp, verify } from "../controller/otpController";

const otpRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

otpRoutes.use("*", apiKeyAuth);

otpRoutes.post("/send", sendOtp);
otpRoutes.post("/verify", verify);

export default otpRoutes;
