-- Developers table
CREATE TABLE IF NOT EXISTS developers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- OTPs table
CREATE TABLE IF NOT EXISTS otps (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  FOREIGN KEY (developer_id) REFERENCES developers(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tokens_developer_id ON tokens(developer_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);
CREATE INDEX IF NOT EXISTS idx_developers_api_key ON developers(api_key);
CREATE INDEX IF NOT EXISTS idx_otps_developer_id ON otps(developer_id);
CREATE INDEX IF NOT EXISTS idx_otps_email_code ON otps(email, otp_code);
