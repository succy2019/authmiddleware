import type { Context } from "hono";
import {
  getDeveloperStats,
  regenerateApiKey,
} from "../respository/repository";

export async function getStats(c: Context) {
  const developerId = c.get("developerId") as string;
  const stats = await getDeveloperStats(c.env.DB, developerId);
  return c.json(stats);
}

export async function regenerateKey(c: Context) {
  const developerId = c.get("developerId") as string;
  const newApiKey = await regenerateApiKey(c.env.DB, developerId);

  return c.json({ api_key: newApiKey });
}
