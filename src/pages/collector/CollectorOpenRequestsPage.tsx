import { RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { CollectorRequestCard } from "../../components/collector/CollectorRequestCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Button } from "../../components/ui/Button";
import { acceptPickupRequest } from "../../services/collectorService";
import { useCollectorRequests } from "../../hooks/useCollectorRequests";
import { getErrorMessage } from "../../utils/errors";

const GREEN = "#82AA68";
const NAVY = "#393666";

export function CollectorOpenRequestsPage() {
  const navigate = useNavigate();
  const { openRequests, loading, error, refresh } = useCollectorRequests();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState("");

  async function handleAccept(requestId: string) {
    setAcceptError("");
    setAcceptingId(requestId);
    try {
      await acceptPickupRequest(requestId);
      await refresh();
      navigate(`/collector/requests/${requestId}`, { state: { promptLiveTracking: true } });
    } catch (err) {
      setAcceptError(getErrorMessage(err));
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <AppLayout title="Open Requests">
      <div className="page-container">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title">City Requests</h1>
            <p className="page-subtitle">Available pickup requests in your city</p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw size={15} />} onClick={refresh}>
            Refresh
          </Button>
        </div>

        {acceptError && (
          <div className="notice notice-error" style={{ marginBottom: 14, borderRadius: 14 }}>
            {acceptError}
          </div>
        )}

        {loading && <LoadingSpinner message="Loading city requests..." />}
        {error && <ErrorState message={error} onRetry={refresh} />}

        {!loading && !error && openRequests.length === 0 && (
          <EmptyState
            icon={<Search size={32} color={GREEN} />}
            iconBg="#EAF4E0"
            title="No open pickup requests available in your city."
            subtitle="New requests will appear here when customers nearby submit a pickup."
            action={{ label: "Refresh", onClick: refresh }}
          />
        )}

        {!loading && !error && openRequests.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: NAVY, fontWeight: 700, marginBottom: 12 }}>
              {openRequests.length} open request{openRequests.length !== 1 ? "s" : ""} available to accept
            </p>
            <div className="requests-grid" style={{ marginBottom: 28 }}>
              {openRequests.map((req) => (
                <CollectorRequestCard
                  key={req.requestId}
                  request={req}
                  showAccept
                  accepting={acceptingId === req.requestId}
                  onAccept={() => handleAccept(req.requestId)}
                  onView={() => navigate(`/collector/requests/${req.requestId}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
