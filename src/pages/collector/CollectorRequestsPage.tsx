import { Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { RequestCard } from "../../components/requests/RequestCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useCollectorRequests } from "../../hooks/useCollectorRequests";
import type { PickupStatus } from "../../types/pickupRequest";

const NAVY = "#393666";
const GREEN = "#82AA68";

type TabKey = "accepted" | "completed" | "cancelled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export function CollectorRequestsPage() {
  const navigate = useNavigate();
  const { assignedRequests, loading, error, refresh } = useCollectorRequests();
  const [activeTab, setActiveTab] = useState<TabKey>("accepted");

  const filtered = assignedRequests.filter((r) => r.status === (activeTab as PickupStatus));

  return (
    <AppLayout title="My Pickups">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Pickups</h1>
          <p className="page-subtitle">Manage your accepted and completed pickup requests</p>
        </div>

        {/* Tab bar */}
        <div className="tab-bar">
          {TABS.map(({ key, label }) => {
            const count = assignedRequests.filter((r) => r.status === key).length;
            return (
              <button
                key={key}
                className={`tab-btn ${activeTab === key ? "active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
                {count > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: activeTab === key ? "#82AA68" : "rgba(57,54,102,0.15)",
                      color: activeTab === key ? "#fff" : NAVY,
                      borderRadius: 100,
                      padding: "1px 7px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && <LoadingSpinner message="Loading pickups..." />}
        {error && <ErrorState message={error} onRetry={refresh} />}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={<Truck size={32} color={GREEN} />}
            iconBg="#EAF4E0"
            title={`No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} pickups`}
            subtitle={
              activeTab === "accepted"
                ? "Accept open requests to see them here."
                : "Pickups in this status will appear here."
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="requests-grid">
            {filtered.map((req) => (
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
