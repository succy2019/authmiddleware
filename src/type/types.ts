export type Bindings = {
  DB: D1Database;
  RESEND_API_KEY: string;
};

export type Developer = {
  id: string;
  name: string;
  email: string;
  api_key: string;
  created_at: string;
};

export type Token = {
  id: string;
  developer_id: string;
  token: string;
  status: "active" | "revoked";
  created_at: string;
  expires_at: string;
};

export type Otp = {
  id: string;
  developer_id: string;
  email: string;
  otp_code: string;
  status: "pending" | "verified" | "expired";
  created_at: string;
  expires_at: string;
};

export type Variables = {
  developer: Developer;
};
