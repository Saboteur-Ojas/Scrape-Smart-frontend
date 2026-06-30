import { ArrowRight, Award, ClipboardList, Leaf, Package, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { RequestCard } from "../../components/requests/RequestCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import { useAuth } from "../../context/AuthContext";
import { useUserRequests } from "../../hooks/useUserRequests";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

function StatCard({ icon: Icon, value, label, color, bg }: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon size={22} color={color} />
      </div>
      <div className="stat-card__value" style={{ color }}>{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

export function UserDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { requests, loading, error, refresh } = useUserRequests();

  const active = requests.filter((r) => r.status === "open" || r.status === "accepted").length;
  const completed = requests.filter((r) => r.status === "completed").length;
  const kgRecycled = completed * 8;

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppLayout title="Dashboard">
      {/* Hero section */}
      <div
        style={{
          background: "linear-gradient(160deg, #EAF4E0 0%, #F4F1EB 100%)",
          padding: "28px 20px 24px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 14, color: MUTED, fontWeight: 500, margin: "0 0 4px" }}>
            {greeting},
          </p>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: NAVY, margin: "0 0 16px" }}>
            Hello, {profile?.name?.split(" ")[0] ?? "there"}
          </h1>

          {/* Eco impact strip */}
          <div
            style={{
              background: `linear-gradient(135deg, ${GREEN}, #6B9754)`,
              borderRadius: 16,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 4px 16px rgba(130,170,104,0.3)",
            }}
          >
            <Leaf size={26} color="#fff" />
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                Your eco impact
              </div>
              <div style={{ fontSize: 15, color: "#fff", fontWeight: 700 }}>
                {completed} completed pickup{completed !== 1 ? "s" : ""} · ~{kgRecycled} kg recycled
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Create request CTA */}
        <button
          onClick={() => navigate("/user/create-request")}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${GREEN}, #6B9754)`,
            border: "none",
            borderRadius: 20,
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            marginBottom: 24,
            boxShadow: "0 6px 24px rgba(130,170,104,0.3)",
            minHeight: "unset",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={24} color="#fff" />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Create Pickup Request</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                Upload photos, detect scrap with AI
              </div>
            </div>
          </div>
          <ArrowRight size={20} color="#fff" />
        </button>

        {/* Stats grid */}
        <div className="stats-grid">
          <StatCard icon={ClipboardList} value={active} label="Active Requests" color={NAVY} bg="#EEEDF8" />
          <StatCard icon={Award} value={completed} label="Completed" color={GREEN} bg="#EAF4E0" />
          <StatCard icon={TrendingUp} value={`${kgRecycled} kg`} label="Kg Recycled" color="#5BBFB5" bg="#E6F8F7" />
          <StatCard icon={Leaf} value={Math.max(0, completed * 2)} label="Trees Saved" color="#5A8043" bg="#E0EDD8" />
        </div>

        {/* Recent requests */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>Recent Requests</h2>
          {requests.length > 0 && (
            <Link
              to="/user/requests"
              style={{ fontSize: 13, fontWeight: 700, color: GREEN, textDecoration: "none" }}
            >
              View all →
            </Link>
          )}
        </div>

        {loading && <LoadingSpinner message="Loading your requests..." />}

        {error && <ErrorState message={error} onRetry={refresh} />}

        {!loading && !error && requests.length === 0 && (
          <EmptyState
            icon={<ClipboardList size={32} color={GREEN} />}
            iconBg="#EAF4E0"
            title="No pickup requests yet"
            subtitle="Create your first request to sell your scrap and make an eco impact!"
            action={{ label: "Create Request", onClick: () => navigate("/user/create-request") }}
          />
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="requests-grid">
            {requests.slice(0, 4).map((req) => (
              <RequestCard
                key={req.requestId}
                request={req}
                onView={() => navigate(`/user/requests/${req.requestId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
