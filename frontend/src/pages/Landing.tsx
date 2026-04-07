import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { session } = useAuth();

  return (
    <div className="-mt-10">
      {/* Hero */}
      <section className="py-24 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-primary tracking-tight leading-tight">
          Authentication &<br />
          <span className="text-accent">Token Management</span> API
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Toklify gives you a production-ready auth layer with API keys,
          session tokens, OTP login, and rate limiting — all in one simple API.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          {session ? (
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-accent text-white font-semibold rounded-xl shadow-lg hover:bg-accent/90 transition-colors text-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3 bg-accent text-white font-semibold rounded-xl shadow-lg hover:bg-accent/90 transition-colors text-lg"
              >
                Get Started — Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-primary font-semibold rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors text-lg"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-primary text-center mb-12">
          Everything you need
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-primary text-center mb-12">
          Get started in 3 steps
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          {steps.map((s, i) => (
            <div key={s.title}>
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {s.title}
              </h3>
              <p className="text-gray-500">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="bg-primary rounded-3xl py-16 px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to secure your app?
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Create a free account, grab your API key, and start
            authenticating users in minutes.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="px-8 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition-colors text-lg"
            >
              Create Account
            </Link>
            <Link
              to="/docs"
              className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-lg"
            >
              Read the Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "🔑",
    title: "API Key Auth",
    description:
      "Every developer gets a unique API key on registration. Authenticate any request with a single header.",
  },
  {
    icon: "🛡️",
    title: "Session Tokens",
    description:
      "Stateless, signed session tokens with configurable expiry. No database lookups on every request.",
  },
  {
    icon: "📧",
    title: "Passwordless OTP",
    description:
      "Email-based one-time codes for login. No passwords to store, hash, or leak.",
  },
  {
    icon: "⏱️",
    title: "Rate Limiting",
    description:
      "Built-in per-key rate limiting with Cloudflare Workers. Protect your endpoints out of the box.",
  },
  {
    icon: "🔄",
    title: "Token Rotation",
    description:
      "Rotate API keys instantly from the dashboard without any downtime.",
  },
  {
    icon: "📖",
    title: "Full API Docs",
    description:
      "Interactive documentation with request/response examples for every endpoint.",
  },
];

const steps = [
  {
    title: "Register",
    description:
      "Create a developer account with your name and email. You'll receive an API key instantly.",
  },
  {
    title: "Integrate",
    description:
      "Add your API key to the X-API-Key header. Use session tokens for user-facing flows.",
  },
  {
    title: "Ship",
    description:
      "Your auth layer is handled. Focus on building your product.",
  },
];
