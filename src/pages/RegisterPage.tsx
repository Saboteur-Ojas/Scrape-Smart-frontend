import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
  MapPin,
  Phone,
  Recycle,
  Truck,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { registerCollector, registerUser } from "../services/authService";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { getErrorMessage } from "../utils/errors";
import {
  requireText,
  validateEmail,
  validatePassword,
  validateServiceAreas,
} from "../utils/validation";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

type Role = "user" | "collector";

// ─── User Registration Form ────────────────────────────────────────────────
function UserRegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    city: "",
    area: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      validateEmail(form.email);
      validatePassword(form.password, form.confirm);
      requireText(form.name, "Name");
      requireText(form.phone, "Phone");
      requireText(form.city, "City");
      requireText(form.area, "Area");
      setLoading(true);
      await registerUser({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        city: form.city,
        area: form.area,
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="notice notice-error" style={{ marginBottom: 16, borderRadius: 12 }}>
          {error}
        </div>
      )}

      <div
        style={{
          background: "#EAF4E0",
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: GREEN,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Home size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>User Account</div>
          <div style={{ fontSize: 11, color: MUTED }}>Sell scrap and track your eco impact</div>
        </div>
      </div>

      <Input
        label="Full Name"
        type="text"
        value={form.name}
        onChange={set("name")}
        placeholder="Ram Shinde"
        autoComplete="name"
        leftIcon={<UserCircle2 size={17} />}
        required
      />
      <Input
        label="Mobile Number"
        type="tel"
        value={form.phone}
        onChange={set("phone")}
        placeholder="+91 98765 43210"
        autoComplete="tel"
        leftIcon={<Phone size={17} />}
        required
      />
      <Input
        label="Email Address"
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder="ram@example.com"
        autoComplete="email"
        leftIcon={<Mail size={17} />}
        required
      />
      <Input
        label="Password"
        type={showPw ? "text" : "password"}
        value={form.password}
        onChange={set("password")}
        placeholder="Min. 6 characters"
        autoComplete="new-password"
        leftIcon={<Lock size={17} />}
        hint="At least 6 characters"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            style={{ border: 0, background: "none", cursor: "pointer", display: "flex", minHeight: "unset", padding: 0, color: MUTED }}
          >
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        }
      />
      <Input
        label="Confirm Password"
        type="password"
        value={form.confirm}
        onChange={set("confirm")}
        placeholder="Re-enter password"
        autoComplete="new-password"
        leftIcon={<Lock size={17} />}
      />
      <Input
        label="City"
        type="text"
        value={form.city}
        onChange={set("city")}
        placeholder="Pune"
        leftIcon={<MapPin size={17} />}
        required
      />
      <Input
        label="Area / Locality"
        type="text"
        value={form.area}
        onChange={set("area")}
        placeholder="Shivaji Nagar"
        leftIcon={<MapPin size={17} />}
        required
      />

      {/* Agreement */}
      <button
        type="button"
        onClick={() => setAgreed((a) => !a)}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          marginBottom: 20,
          textAlign: "left",
          width: "100%",
          minHeight: "unset",
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: agreed ? GREEN : "transparent",
            border: `2px solid ${agreed ? GREEN : "#BAB9EB"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {agreed && <Check size={12} color="#fff" strokeWidth={3} />}
        </div>
        <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
          I agree to the Terms of Service and Privacy Policy
        </span>
      </button>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={!agreed}
      >
        Create Account
      </Button>
    </form>
  );
}

// ─── Collector Registration Form ───────────────────────────────────────────
function CollectorRegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    city: "",
    serviceAreas: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      validateEmail(form.email);
      validatePassword(form.password, form.confirm);
      requireText(form.name, "Name");
      requireText(form.phone, "Phone");
      requireText(form.city, "City");
      const serviceAreas = validateServiceAreas(form.serviceAreas);
      setLoading(true);
      await registerCollector({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        city: form.city,
        serviceAreas,
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="notice notice-error" style={{ marginBottom: 16, borderRadius: 12 }}>
          {error}
        </div>
      )}

      <div
        style={{
          background: "#EEEDF8",
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: NAVY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Truck size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Collector Account</div>
          <div style={{ fontSize: 11, color: MUTED }}>Manual verification after signup</div>
        </div>
      </div>

      <Input label="Full Name" type="text" value={form.name} onChange={set("name")} placeholder="Ramesh Kumar" leftIcon={<UserCircle2 size={17} />} required />
      <Input label="Mobile Number" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 99887 76655" leftIcon={<Phone size={17} />} required />
      <Input label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="ramesh@example.com" leftIcon={<Mail size={17} />} required />
      <Input
        label="Password"
        type={showPw ? "text" : "password"}
        value={form.password}
        onChange={set("password")}
        placeholder="Min. 6 characters"
        leftIcon={<Lock size={17} />}
        hint="At least 6 characters"
        rightElement={
          <button type="button" onClick={() => setShowPw((v) => !v)} style={{ border: 0, background: "none", cursor: "pointer", display: "flex", minHeight: "unset", padding: 0, color: MUTED }}>
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        }
      />
      <Input label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Re-enter password" leftIcon={<Lock size={17} />} />
      <Input label="City" type="text" value={form.city} onChange={set("city")} placeholder="Pune" leftIcon={<MapPin size={17} />} required />
      <Input
        label="Service Areas"
        type="text"
        value={form.serviceAreas}
        onChange={set("serviceAreas")}
        placeholder="Shivaji Nagar, Kothrud, FC Road"
        leftIcon={<MapPin size={17} />}
        hint="Enter comma-separated localities where you pick up scrap"
        required
      />

      {/* Agreement */}
      <button
        type="button"
        onClick={() => setAgreed((a) => !a)}
        style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 20, textAlign: "left", width: "100%", minHeight: "unset" }}
      >
        <div style={{ width: 20, height: 20, borderRadius: 6, background: agreed ? GREEN : "transparent", border: `2px solid ${agreed ? GREEN : "#BAB9EB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          {agreed && <Check size={12} color="#fff" strokeWidth={3} />}
        </div>
        <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
          I agree to the Collector Agreement and Privacy Policy
        </span>
      </button>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} disabled={!agreed}>
        Create Collector Account
      </Button>
    </form>
  );
}

// ─── Register Page ─────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") as Role | null;
  const [role, setRole] = useState<Role | null>(initialRole);
  const [step, setStep] = useState<"select" | "form">(initialRole ? "select" : "select");

  function handleSuccess() {
    const dest = role === "collector" ? "/collector/dashboard" : "/user/dashboard";
    navigate(dest, { replace: true });
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

      <div className="auth-card" style={{ maxWidth: 480 }}>
        {step === "select" ? (
          <>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: "0 0 6px" }}>
                Create Account
              </h1>
              <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>
                Choose your role to get started
              </p>
            </div>

            {/* Role selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
              {([
                {
                  id: "user" as const,
                  icon: Home,
                  title: "I want to sell scrap",
                  desc: "Sell scrap from your home at fair prices",
                  color: GREEN,
                  bg: "#EAF4E0",
                },
                {
                  id: "collector" as const,
                  icon: Truck,
                  title: "I'm a Scrap Collector",
                  desc: "Find pickup requests and grow your business",
                  color: NAVY,
                  bg: "#EEEDF8",
                },
              ] as const).map(({ id, icon: Icon, title, desc, color, bg }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 18,
                    borderRadius: 18,
                    border: `2px solid ${role === id ? color : "rgba(57,54,102,0.10)"}`,
                    background: role === id ? color : "#fff",
                    cursor: "pointer",
                    boxShadow:
                      role === id ? `0 6px 24px ${color}33` : "0 2px 12px rgba(57,54,102,0.06)",
                    transition: "all 0.15s",
                    textAlign: "left",
                    width: "100%",
                    minHeight: "unset",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: role === id ? "rgba(255,255,255,0.22)" : bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} color={role === id ? "#fff" : color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: role === id ? "#fff" : NAVY,
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: role === id ? "rgba(255,255,255,0.8)" : MUTED,
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    color={role === id ? "rgba(255,255,255,0.7)" : MUTED}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!role}
              onClick={() => setStep("form")}
            >
              Continue
            </Button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span style={{ fontSize: 14, color: MUTED }}>Already have an account? </span>
              <Link
                to="/login"
                style={{ fontSize: 14, fontWeight: 700, color: GREEN, textDecoration: "none" }}
              >
                Sign In
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              type="button"
              onClick={() => setStep("select")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: MUTED,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 18,
                padding: 0,
                minHeight: "unset",
              }}
            >
              ← Back
            </button>

            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: "0 0 4px" }}>
                {role === "collector" ? "Collector Registration" : "User Registration"}
              </h1>
              <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
                {role === "collector"
                  ? "Fill in your details. Verification takes 1-2 business days."
                  : "Create your account to start selling scrap."}
              </p>
            </div>

            {role === "user" ? (
              <UserRegisterForm onSuccess={handleSuccess} />
            ) : (
              <CollectorRegisterForm onSuccess={handleSuccess} />
            )}
          </>
        )}
      </div>

      <Link
        to="/"
        style={{ marginTop: 20, fontSize: 13, color: MUTED, textDecoration: "none", fontWeight: 500 }}
      >
        ← Back to home
      </Link>
    </div>
  );
}
