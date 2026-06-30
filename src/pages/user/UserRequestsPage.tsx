import { ClipboardList, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { RequestCard } from "../../components/requests/RequestCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { Button } from "../../components/ui/Button";
import { cancelMyPickupRequest } from "../../services/pickupRequestService";
import { useUserRequests } from "../../hooks/useUserRequests";
import { getErrorMessage } from "../../utils/errors";
import { useState } from "react";

const NAVY = "#393666";

export function UserRequestsPage() {
  const navigate = useNavigate();
  const { requests, loading, error, refresh } = useUserRequests();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");

  async function handleCancel(requestId: string) {
    setCancelError("");
    setCancellingId(requestId);
    try {
      await cancelMyPickupRequest(requestId);
      await refresh();
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <AppLayout title="My Requests">
      <div className="page-container">
        <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title">My Requests</h1>
            <p className="page-subtitle">Track and manage your scrap pickups</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate("/user/create-request")}
          >
            New Request
          </Button>
        </div>

        {cancelError && (
          <div className="notice notice-error" style={{ marginBottom: 14, borderRadius: 14 }}>
            {cancelError}
          </div>
        )}

        {loading && <LoadingSpinner message="Loading your requests..." />}
        {error && <ErrorState message={error} onRetry={refresh} />}

        {!loading && !error && requests.length === 0 && (
          <EmptyState
            icon={<ClipboardList size={32} color="#82AA68" />}
            iconBg="#EAF4E0"
            title="No pickup requests yet"
            subtitle="Submit your first scrap pickup request and a collector in your city can accept it."
            action={{ label: "Create Request", onClick: () => navigate("/user/create-request") }}
          />
        )}

        {!loading && !error && requests.length > 0 && (
          <>
            <p style={{ fontSize: 13, color: NAVY, fontWeight: 600, marginBottom: 12 }}>
              {requests.length} request{requests.length !== 1 ? "s" : ""}
            </p>
            <div className="requests-grid">
              {requests.map((req) => (
                <RequestCard
                  key={req.requestId}
                  request={req}
                  onView={() => navigate(`/user/requests/${req.requestId}`)}
                  actions={
                    req.status === "open" ? (
                      <button
                        onClick={() => handleCancel(req.requestId)}
                        disabled={cancellingId === req.requestId}
                        className="btn btn-danger btn-sm"
                      >
                        {cancellingId === req.requestId ? "Cancelling..." : "Cancel"}
                      </button>
                    ) : null
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
