import type { Context } from "hono";
import { createDeveloper } from "../respository/repository";

export async function 
register(c: Context) {
  const body = await c.req.json<{ name: string; email: string }>();

  if (!body.name || !body.email) {
    return c.json({ error: "name and email are required" }, 400);
  }

  try {
    const developer = await createDeveloper(c.env.DB, body.name, body.email);
if (!developer) {
      return c.json({ error: "Failed to create developer" }, 500);
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${c.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Your App <onboarding@toklify.sbs>",
        to: [developer.email],
        subject: "Your API Key",
        html: `<p>Welcome ${developer.name}! Your API key is: <code>${developer.raw_api_key}</code></p>`
      })
    });

    return c.json(
      {
        id: developer.id,
        name: developer.name,
        email: developer.email,
        api_key: developer.raw_api_key,
        created_at: developer.created_at,
      },
      201
    );
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint failed")) {
      return c.json(
        { error: "A developer with this email already exists" },
        409
      );
    }
    throw e;
  }
}
