import { ArrowRight, Award, Bell, ClipboardList, Search, Star, Truck } from "lucide-react";
import { useNavigate } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { RequestCard } from "../../components/requests/RequestCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useCollectorRequests } from "../../hooks/useCollectorRequests";
import { useCollectorNotifications } from "../../hooks/useCollectorNotifications";
import { markNotificationRead } from "../../services/notificationService";

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

export function CollectorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { collector, openRequests, assignedRequests, reviews, loading, error, refresh } = useCollectorRequests();
  const { notifications } = useCollectorNotifications();

  if (loading) return (
    <AppLayout title="Dashboard">
      <LoadingSpinner message="Loading your dashboard..." fullPage />
    </AppLayout>
  );

  if (error) return (
    <AppLayout title="Dashboard">
      <div className="page-container"><ErrorState message={error} onRetry={refresh} /></div>
    </AppLayout>
  );

  const active = assignedRequests.filter((r) => r.status === "accepted").length;
  const completed = assignedRequests.filter((r) => r.status === "completed").length;
  
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppLayout title="Dashboard">
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #EEEDF8 0%, #F4F1EB 100%)", padding: "28px 20px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 14, color: MUTED, fontWeight: 500, margin: "0 0 4px" }}>{greeting},</p>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, color: NAVY, margin: "0 0 16px" }}>
            Hello, {profile?.name?.split(" ")[0] ?? "Collector"}
          </h1>
          {collector && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EAF4E0", borderRadius: 100, padding: "6px 14px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#5A8043" }}>Active Collector</span>
              {collector.isAvailable && <span style={{ fontSize: 12, color: MUTED }}>· Available</span>}
            </div>
          )}
        </div>
      </div>

      <div className="page-container">
        {/* Stats */}
        {notifications.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Bell size={18} color={NAVY} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: NAVY, margin: 0 }}>New nearby requests</h2>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {notifications.map((notification) => (
                <button
                  key={notification.notificationId}
                  onClick={() => {
                    markNotificationRead(notification.notificationId).catch(() => undefined);
                    navigate("/collector/open-requests");
                  }}
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(130,170,104,0.24)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: "0 2px 12px rgba(57,54,102,0.06)",
                    minHeight: "unset",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{notification.title}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{notification.message}</div>
                    </div>
                    <ArrowRight size={16} color={GREEN} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon={Search} value={openRequests.length} label="Open Nearby" color={NAVY} bg="#EEEDF8" />
          <StatCard icon={Truck} value={active} label="Active Pickups" color="#D4880A" bg="#FDF3E7" />
          <StatCard icon={Award} value={completed} label="Completed" color={GREEN} bg="#EAF4E0" />
          <StatCard icon={Star} value={averageRating.toFixed(1)} label="Rating" color="#F2A65A" bg="#FEF5EC" />
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => navigate("/collector/open-requests")}
            style={{
              background: `linear-gradient(135deg, ${GREEN}, #6B9754)`,
              border: "none",
              borderRadius: 18,
              padding: "18px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
              boxShadow: "0 6px 24px rgba(130,170,104,0.3)",
              minHeight: "unset",
            }}
          >
            <Search size={24} color="#fff" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Open Requests</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{openRequests.length} nearby</div>
            </div>
            <ArrowRight size={16} color="rgba(255,255,255,0.7)" />
          </button>

          <button
            onClick={() => navigate("/collector/requests")}
            style={{
              background: "#fff",
              border: "1px solid rgba(57,54,102,0.08)",
              borderRadius: 18,
              padding: "18px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
              boxShadow: "0 2px 12px rgba(57,54,102,0.06)",
              minHeight: "unset",
            }}
          >
            <ClipboardList size={24} color={NAVY} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>My Pickups</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{active} active</div>
            </div>
            <ArrowRight size={16} color={MUTED} />
          </button>
        </div>

        {/* Recent assigned requests */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>Recent Pickups</h2>
        </div>

        {assignedRequests.length === 0 ? (
          <EmptyState
            icon={<Truck size={32} color={GREEN} />}
            iconBg="#EAF4E0"
            title="No pickups yet"
            subtitle="Accept open requests to start earning. Check the Open Requests tab."
            action={{ label: "View Open Requests", onClick: () => navigate("/collector/open-requests") }}
          />
        ) : (
          <div className="requests-grid">
            {assignedRequests.slice(0, 4).map((req) => (
              <RequestCard
                key={req.requestId}
                request={req}
                onView={() => navigate(`/collector/requests/${req.requestId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
