import { Eye, EyeOff, Lock, Mail, Recycle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";
import { validateEmail } from "../utils/validation";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Client-side validation
    try {
      validateEmail(email);
    } catch (err) {
      setError(getErrorMessage(err));
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      const destination =
        result.profile.role === "collector" ? "/collector/dashboard" : "/user/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Check your email and password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Logo */}
      <div className="auth-logo">
        <div className="auth-logo__icon">
          <Recycle size={26} color="#fff" />
        </div>
        <div>
          <div className="auth-logo__name">ScrapSmart</div>
          <div style={{ fontSize: 11, color: MUTED }}>Smart Scrap Pickup</div>
        </div>
      </div>

      {/* Auth card */}
      <div className="auth-card">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: NAVY, margin: "0 0 6px" }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
            Sign in to your ScrapSmart account
          </p>
        </div>

        {/* Error notice */}
        {error && (
          <div className="notice notice-error" style={{ marginBottom: 16, borderRadius: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<Mail size={17} />}
          />

          <Input
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            leftIcon={<Lock size={17} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  border: 0,
                  background: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: MUTED,
                  minHeight: "unset",
                  padding: 0,
                }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div
          style={{
            borderTop: "1px solid rgba(57,54,102,0.08)",
            marginTop: 20,
            paddingTop: 20,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 14, color: MUTED }}>Don't have an account? </span>
          <Link
            to="/register"
            style={{ fontSize: 14, fontWeight: 700, color: GREEN, textDecoration: "none" }}
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Back to home */}
      <Link
        to="/"
        style={{
          marginTop: 20,
          fontSize: 13,
          color: MUTED,
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        ← Back to home
      </Link>
    </div>
  );
}
