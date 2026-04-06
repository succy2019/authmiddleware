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
      from: "Your App <onboarding@resend.dev>",
      to: [body.email],
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <strong>${otp.raw_otp_code}</strong></p><p>This code expires in ${Math.round((new Date(otp.expires_at).getTime() - Date.now()) / 60000)} minutes.</p>`,
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
