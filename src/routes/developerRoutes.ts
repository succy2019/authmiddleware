import { Hono } from "hono";
import type { Bindings, Variables } from "../type/types";
import { register } from "../controller/developerController";

const developerRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

developerRoutes.post("/register", register);

export default developerRoutes;
