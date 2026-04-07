import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.register(name, email);
      setApiKey(res.api_key);
      setSession({
        token: res.session_token,
        developer: res.developer,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (apiKey) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-green-600 px-8 py-6 text-center">
              <div className="text-3xl mb-2">&#10003;</div>
              <h1 className="text-2xl font-bold text-white">
                Registration Successful
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Your account has been created
              </p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your API Key
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-3">
                  <code className="text-sm text-primary font-mono flex-1 break-all">
                    {apiKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-secondary transition-colors cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm font-medium">Important</p>
                <p className="text-amber-700 text-sm mt-1">
                  Save this API key now. You won&apos;t be able to see it again.
                  It has also been sent to your email.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-primary px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white">Create an account</h1>
            <p className="text-white/60 text-sm mt-1">
              Get your API key and start building
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-accent font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
