import type { Context } from "hono";
import { createOtp, verifyOtp } from "../respository/repository";

export async function sendOtp(c: Context) {
  const developer = c.get("developer");
  const body = await c.req.json<{ email: string; expires_in?: number }>();

  if (!body.email) {
    return c.json({ error: "email is required" }, 400);
  }

  const otp = await createOtp(
    c.env.DB,
    developer.id,
    body.email,
    body.expires_in
  );

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Your App <onboarding@toklify.sbs>",
      to: [body.email],
      subject: "Your OTP Code",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #1a1a2e; padding: 30px 40px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Verification Code</h1>
          </div>
          <div style="padding: 40px; border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; line-height: 1.8; margin-top: 0;">Hi,</p>
            <p style="font-size: 16px; color: #555; line-height: 1.8;">Use the following one-time password to complete your verification:</p>
            <div style="background: #f8f9fa; border: 1px solid #e2e6ea; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
              <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; color: #1a1a2e; letter-spacing: 6px;">${otp.raw_otp_code}</span>
            </div>
            <p style="font-size: 14px; color: #555; line-height: 1.8;">This code expires in <strong>${Math.round((new Date(otp.expires_at).getTime() - Date.now()) / 60000)} minutes</strong>.</p>
            <div style="border-top: 1px solid #eee; margin-top: 32px; padding-top: 20px;">
              <p style="font-size: 13px; color: #999; line-height: 1.6; margin: 0;">If you did not request this code, you can safely ignore this email.</p>
            </div>
          </div>
          <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">&copy; Toklify. All rights reserved.</p>
        </div>
      `,
    }),
  });

  if (!emailResponse.ok) {
    return c.json({ error: "Failed to send OTP email" }, 500);
  }

  return c.json(
    {
      message: "OTP sent successfully",
      email: otp.email,
      expires_at: otp.expires_at,
    },
    201
  );
}

export async function verify(c: Context) {
  const developer = c.get("developer");
  const body = await c.req.json<{ email: string; otp: string }>();

  if (!body.email || !body.otp) {
    return c.json({ error: "email and otp are required" }, 400);
  }

  const result = await verifyOtp(c.env.DB, developer.id, body.email, body.otp);

  if (!result.valid) {
    return c.json({ valid: false, reason: result.reason }, 200);
  }

  return c.json({ valid: true, message: "OTP verified successfully" });
}
