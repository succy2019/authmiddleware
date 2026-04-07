import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-primary shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-white text-xl font-bold tracking-wide">
            Toklify
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/docs"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Docs
            </Link>
            {session ? (
              <>
                <span className="text-white/70 text-sm hidden sm:inline">
                  {session.developer.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-white bg-accent hover:bg-accent/90 px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
