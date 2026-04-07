import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";

export default function Login() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(email);
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.verifyLogin(email, otp);
      if (!res.valid) {
        setError(res.reason || "Invalid OTP");
        return;
      }
      setSession({
        token: res.session_token!,
        developer: res.developer!,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-primary px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-white/60 text-sm mt-1">
              Sign in to your dashboard
            </p>
          </div>

          <div className="p-8">
            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
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
                  {loading ? "Sending..." : "Send Login Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-5">
                <p className="text-sm text-slate-500 text-center">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-slate-700">{email}</span>
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Verification code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-center tracking-[0.3em] font-mono text-lg"
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setError("");
                  }}
                  className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Use a different email
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-accent font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
