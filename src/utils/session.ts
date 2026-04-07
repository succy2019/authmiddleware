export async function createSessionToken(
  developerId: string,
  secret: string
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + 86400;
  const data = `${developerId}.${exp}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  const sigHex = [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${data}.${sigHex}`;
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<string | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [developerId, expStr, sigHex] = parts;
  const exp = parseInt(expStr);
  if (isNaN(exp) || exp < Math.floor(Date.now() / 1000)) return null;

  const data = `${developerId}.${expStr}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = new Uint8Array(
    sigHex.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(data)
  );

  return valid ? developerId : null;
}
