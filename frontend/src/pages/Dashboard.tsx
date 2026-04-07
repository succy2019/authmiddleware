import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";

interface Stats {
  total_tokens: number;
  active_tokens: number;
  revoked_tokens: number;
  total_otps: number;
  verified_otps: number;
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newApiKey, setNewApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (session) {
      api
        .getStats(session.token)
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleRegenerate = async () => {
    if (!session) return;
    setRegenerating(true);
    try {
      const res = await api.regenerateApiKey(session.token);
      setNewApiKey(res.api_key);
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {session.developer.name}
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s an overview of your API usage.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 animate-pulse"
            >
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Tokens Issued"
            value={stats.total_tokens}
            color="text-primary"
          />
          <StatCard
            label="Active Tokens"
            value={stats.active_tokens}
            color="text-green-600"
          />
          <StatCard
            label="Revoked Tokens"
            value={stats.revoked_tokens}
            color="text-red-500"
          />
          <StatCard
            label="Total OTPs Sent"
            value={stats.total_otps}
            color="text-primary"
          />
          <StatCard
            label="Verified OTPs"
            value={stats.verified_otps}
            color="text-green-600"
          />
        </div>
      ) : null}

      {/* API Key Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">API Key</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Use this key in the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">X-API-Key</code> header for API requests.
            </p>
          </div>
        </div>

        {newApiKey ? (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-3">
              <code className="text-sm text-primary font-mono flex-1 break-all">
                {newApiKey}
              </code>
              <button
                onClick={() => handleCopy(newApiKey)}
                className="shrink-0 text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-secondary transition-colors cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-700 text-sm">
                Save this key now. You won&apos;t be able to see it again. Your
                previous key has been invalidated.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <code className="text-sm text-slate-400 font-mono">
                ••••••••••••••••••••••••••••••
              </code>
              <p className="text-xs text-slate-400 mt-1">
                Your key was shown at registration and sent to your email.
              </p>
            </div>
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="shrink-0 text-sm text-accent border border-accent px-4 py-2 rounded-lg hover:bg-accent hover:text-white transition-colors cursor-pointer"
              >
                Regenerate
              </button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="text-sm text-slate-500 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {regenerating ? "Regenerating..." : "Confirm"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="text-slate-800 font-medium mt-0.5">
              {session.developer.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="text-slate-800 font-medium mt-0.5">
              {session.developer.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Member since</p>
            <p className="text-slate-800 font-medium mt-0.5">
              {new Date(session.developer.created_at).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
