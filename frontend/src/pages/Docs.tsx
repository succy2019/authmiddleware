import { useState, useEffect } from "react";

const BASE_URL = "https://toklify.sbs";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  auth?: string;
  headers?: Record<string, string>;
  body?: object;
  responses: { status: number; label: string; body: object | string }[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  endpoints: Endpoint[];
}

const sections: Section[] = [
  {
    id: "authentication",
    title: "Authentication",
    description:
      "Register a developer account, log in with a passwordless OTP, and verify the code to receive a session token. No API key is required for these endpoints.",
    endpoints: [
      {
        method: "POST",
        path: "/auth/register",
        description:
          "Create a new developer account. Returns an API key and session token. The API key is also emailed to you.",
        body: { name: "John Doe", email: "john@example.com" },
        responses: [
          {
            status: 201,
            label: "Created",
            body: {
              developer: {
                id: "uuid",
                name: "John Doe",
                email: "john@example.com",
                created_at: "2026-04-06T12:00:00.000Z",
              },
              api_key: "ak_1a2b3c4d5e6f...",
              session_token: "uuid.exp.signature",
            },
          },
          {
            status: 400,
            label: "Bad Request",
            body: { error: "name and email are required" },
          },
          {
            status: 409,
            label: "Conflict",
            body: { error: "A developer with this email already exists" },
          },
        ],
      },
      {
        method: "POST",
        path: "/auth/login",
        description:
          "Send a one-time login code to the developer's registered email address.",
        body: { email: "john@example.com" },
        responses: [
          {
            status: 200,
            label: "OK",
            body: { message: "Login code sent to your email" },
          },
          {
            status: 400,
            label: "Bad Request",
            body: { error: "email is required" },
          },
          {
            status: 404,
            label: "Not Found",
            body: { error: "No account found with this email" },
          },
        ],
      },
      {
        method: "POST",
        path: "/auth/verify",
        description:
          "Verify the OTP code received via email and get a session token.",
        body: { email: "john@example.com", otp: "123456" },
        responses: [
          {
            status: 200,
            label: "Verified",
            body: {
              valid: true,
              developer: {
                id: "uuid",
                name: "John Doe",
                email: "john@example.com",
                created_at: "2026-04-06T12:00:00.000Z",
              },
              session_token: "uuid.exp.signature",
            },
          },
          {
            status: 200,
            label: "Invalid OTP",
            body: { valid: false, reason: "Invalid OTP" },
          },
          {
            status: 200,
            label: "Expired OTP",
            body: { valid: false, reason: "OTP has expired" },
          },
        ],
      },
    ],
  },
  {
    id: "tokens",
    title: "Tokens",
    description:
      "Issue, verify, and revoke opaque tokens. All token endpoints require your API key in the X-API-Key header.",
    endpoints: [
      {
        method: "POST",
        path: "/tokens/issue",
        description:
          "Issue a new opaque token. Optionally specify expiry in seconds (default: 3600).",
        auth: "X-API-Key",
        body: { expires_in: 3600 },
        responses: [
          {
            status: 201,
            label: "Created",
            body: {
              token: "a1b2c3d4e5f6...",
              status: "active",
              expires_at: "2026-04-06T13:00:00.000Z",
              created_at: "2026-04-06T12:00:00.000Z",
            },
          },
        ],
      },
      {
        method: "POST",
        path: "/tokens/verify",
        description:
          "Check whether a token is valid, expired, or revoked.",
        auth: "X-API-Key",
        body: { token: "a1b2c3d4e5f6..." },
        responses: [
          {
            status: 200,
            label: "Valid",
            body: { valid: true, expires_at: "2026-04-06T13:00:00.000Z" },
          },
          {
            status: 200,
            label: "Not Found",
            body: { valid: false, reason: "Token not found" },
          },
          {
            status: 200,
            label: "Revoked",
            body: { valid: false, reason: "Token has been revoked" },
          },
          {
            status: 200,
            label: "Expired",
            body: { valid: false, reason: "Token has expired" },
          },
        ],
      },
      {
        method: "POST",
        path: "/tokens/revoke",
        description: "Permanently revoke an active token.",
        auth: "X-API-Key",
        body: { token: "a1b2c3d4e5f6..." },
        responses: [
          {
            status: 200,
            label: "Revoked",
            body: { message: "Token revoked successfully" },
          },
          {
            status: 404,
            label: "Not Found",
            body: { error: "Token not found or already revoked" },
          },
        ],
      },
    ],
  },
  {
    id: "otp",
    title: "OTP",
    description:
      "Send and verify email-based one-time passwords for your end users. All OTP endpoints require your API key in the X-API-Key header.",
    endpoints: [
      {
        method: "POST",
        path: "/otp/send",
        description:
          "Send a 6-digit OTP to the specified email. Optionally set expiry in seconds (default: 600).",
        auth: "X-API-Key",
        body: { email: "user@example.com", expires_in: 600 },
        responses: [
          {
            status: 201,
            label: "Sent",
            body: {
              message: "OTP sent successfully",
              email: "user@example.com",
              expires_at: "2026-04-06T12:10:00.000Z",
            },
          },
          {
            status: 400,
            label: "Bad Request",
            body: { error: "email is required" },
          },
          {
            status: 500,
            label: "Email Failed",
            body: { error: "Failed to send OTP email" },
          },
        ],
      },
      {
        method: "POST",
        path: "/otp/verify",
        description: "Verify an OTP code for a given email address.",
        auth: "X-API-Key",
        body: { email: "user@example.com", otp: "123456" },
        responses: [
          {
            status: 200,
            label: "Verified",
            body: { valid: true, message: "OTP verified successfully" },
          },
          {
            status: 200,
            label: "Invalid",
            body: { valid: false, reason: "Invalid OTP" },
          },
          {
            status: 200,
            label: "Expired",
            body: { valid: false, reason: "OTP has expired" },
          },
        ],
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description:
      "View account statistics and manage your API key. All dashboard endpoints require a session token in the Authorization header.",
    endpoints: [
      {
        method: "GET",
        path: "/dashboard/stats",
        description: "Get usage statistics for your account.",
        auth: "Bearer",
        responses: [
          {
            status: 200,
            label: "OK",
            body: {
              total_tokens: 15,
              active_tokens: 8,
              revoked_tokens: 3,
              total_otps: 42,
              verified_otps: 38,
            },
          },
        ],
      },
      {
        method: "POST",
        path: "/dashboard/regenerate-key",
        description:
          "Generate a new API key. The previous key is immediately invalidated.",
        auth: "Bearer",
        responses: [
          {
            status: 200,
            label: "OK",
            body: { api_key: "ak_new_key_here..." },
          },
        ],
      },
    ],
  },
];

/* ─── Reusable UI ─── */

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-amber-100 text-amber-700",
    DELETE: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded ${colors[method] || "bg-slate-100 text-slate-700"}`}
    >
      {method}
    </span>
  );
}

function CodeBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-100 text-sm p-4 rounded-lg overflow-x-auto leading-relaxed">
        <code>{content}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded transition-opacity cursor-pointer"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);

  const curlExample = buildCurl(ep);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        <MethodBadge method={ep.method} />
        <code className="text-sm font-mono text-primary font-medium">
          {ep.path}
        </code>
        <span className="text-sm text-slate-500 ml-auto hidden sm:inline truncate max-w-[260px]">
          {ep.description}
        </span>
        <span
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          &#9660;
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {ep.description}
          </p>

          {/* Auth */}
          {ep.auth && (
            <div className="text-sm">
              <span className="font-medium text-slate-700">
                Authorization:{" "}
              </span>
              <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                {ep.auth === "Bearer"
                  ? "Authorization: Bearer <session_token>"
                  : "X-API-Key: <your_api_key>"}
              </code>
            </div>
          )}

          {/* Request body */}
          {ep.body && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Request Body
              </p>
              <CodeBlock content={JSON.stringify(ep.body, null, 2)} />
            </div>
          )}

          {/* cURL example */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Example Request
            </p>
            <CodeBlock content={curlExample} />
          </div>

          {/* Responses */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Responses
            </p>
            <div className="space-y-3">
              {ep.responses.map((r, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        r.status < 300
                          ? "bg-green-100 text-green-700"
                          : r.status < 500
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-sm text-slate-500">{r.label}</span>
                  </div>
                  <CodeBlock content={JSON.stringify(r.body, null, 2)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildCurl(ep: Endpoint): string {
  const parts = [`curl -X ${ep.method} ${BASE_URL}${ep.path}`];
  parts.push(`  -H "Content-Type: application/json"`);
  if (ep.auth === "X-API-Key") parts.push(`  -H "X-API-Key: YOUR_API_KEY"`);
  if (ep.auth === "Bearer")
    parts.push(`  -H "Authorization: Bearer YOUR_SESSION_TOKEN"`);
  if (ep.body) parts.push(`  -d '${JSON.stringify(ep.body)}'`);
  return parts.join(" \\\n");
}

/* ─── Sidebar nav item ─── */

function NavItem({
  id,
  title,
  active,
}: {
  id: string;
  title: string;
  active: boolean;
}) {
  return (
    <a
      href={`#${id}`}
      className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
        active
          ? "bg-accent/10 text-accent font-semibold"
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
      }`}
    >
      {title}
    </a>
  );
}

/* ─── Main page ─── */

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const ids = ["overview", ...sections.map((s) => s.id)];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex gap-10">
      {/* Sidebar */}
      <aside className="hidden lg:block w-52 shrink-0 sticky top-28 self-start space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
          On this page
        </p>
        <NavItem id="overview" title="Overview" active={activeSection === "overview"} />
        {sections.map((s) => (
          <NavItem
            key={s.id}
            id={s.id}
            title={s.title}
            active={activeSection === s.id}
          />
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-16">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            API Documentation
          </h1>
          <p className="text-slate-500 mt-2">
            Complete reference for the Toklify Auth Middleware API.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 rounded-lg px-4 py-2">
            <span className="text-xs text-slate-400 font-medium">
              Base URL
            </span>
            <code className="text-sm font-mono text-primary font-medium">
              {BASE_URL}
            </code>
          </div>
        </div>

        {/* Overview */}
        <section id="overview" className="scroll-mt-24 space-y-8">
          <h2 className="text-2xl font-bold text-slate-800">Overview</h2>

          {/* Quick Start */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-5">
            <h3 className="text-lg font-semibold text-slate-800">
              Quick Start
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  1. Register &amp; get your API key
                </p>
                <CodeBlock
                  content={`curl -X POST ${BASE_URL}/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name": "John Doe", "email": "john@example.com"}'`}
                />
                <p className="text-sm text-slate-500 mt-2">
                  Save the{" "}
                  <code className="bg-slate-100 px-1 rounded text-xs">
                    api_key
                  </code>{" "}
                  from the response. It's also emailed to you.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  2. Issue a token
                </p>
                <CodeBlock
                  content={`curl -X POST ${BASE_URL}/tokens/issue \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{"expires_in": 3600}'`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  3. Verify a token
                </p>
                <CodeBlock
                  content={`curl -X POST ${BASE_URL}/tokens/verify \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{"token": "YOUR_TOKEN"}'`}
                />
              </div>
            </div>
          </div>

          {/* Auth methods */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Authentication Methods
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The API uses two authentication methods depending on the endpoint:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="font-semibold text-sm text-slate-700">API Key</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Required for{" "}
                  <code className="bg-white px-1 rounded">/tokens/*</code> and{" "}
                  <code className="bg-white px-1 rounded">/otp/*</code>.
                  <br />
                  Header:{" "}
                  <code className="bg-white px-1 rounded">
                    X-API-Key: &lt;key&gt;
                  </code>
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="font-semibold text-sm text-slate-700">
                  Session Token
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Required for{" "}
                  <code className="bg-white px-1 rounded">/dashboard/*</code>.
                  <br />
                  Header:{" "}
                  <code className="bg-white px-1 rounded">
                    Authorization: Bearer &lt;token&gt;
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">
              Rate Limiting
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              All endpoints are rate limited to{" "}
              <strong>100 requests per 60 seconds</strong> per IP address. If
              you exceed this limit you'll receive a{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                429 Too Many Requests
              </code>{" "}
              response.
            </p>
          </div>
        </section>

        {/* Endpoint sections */}
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 space-y-5"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {section.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                {section.description}
              </p>
            </div>
            <div className="space-y-3">
              {section.endpoints.map((ep, i) => (
                <EndpointCard key={i} ep={ep} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
