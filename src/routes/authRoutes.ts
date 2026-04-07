import { Hono } from "hono";
import type { Bindings } from "../type/types";
import { register, login, verifyLogin } from "../controller/authController";

const authRoutes = new Hono<{ Bindings: Bindings }>();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/verify", verifyLogin);

export default authRoutes;
