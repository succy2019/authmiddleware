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
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: #1a1a2e; padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Welcome to Toklify</h1>
            </div>
            <div style="padding: 40px; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; color: #333; line-height: 1.8; margin-top: 0;">Hi <strong>${developer.name}</strong>,</p>
              <p style="font-size: 16px; color: #555; line-height: 1.8;">Thank you for registering. Your account has been created successfully. Below is your API key:</p>
              <div style="background: #f8f9fa; border: 1px solid #e2e6ea; padding: 16px 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
                <span style="font-family: 'Courier New', monospace; font-size: 15px; color: #1a1a2e; letter-spacing: 0.5px; word-break: break-all;">${developer.raw_api_key}</span>
              </div>
              <p style="font-size: 14px; color: #555; line-height: 1.8;">Include this key in the <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 13px;">X-API-Key</code> header when making requests.</p>
              <div style="border-top: 1px solid #eee; margin-top: 32px; padding-top: 20px;">
                <p style="font-size: 13px; color: #999; line-height: 1.6; margin: 0;">Keep this key confidential. Do not share it publicly or commit it to version control.</p>
              </div>
            </div>
            <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">&copy; Toklify. All rights reserved.</p>
          </div>
        `
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
