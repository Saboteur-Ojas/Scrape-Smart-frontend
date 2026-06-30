import { ArrowLeft, CheckCircle2, MapPin, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { StatusTimeline } from "../../components/requests/StatusTimeline";
import { RequestStatusBadge } from "../../components/requests/RequestStatusBadge";
import { ReviewForm } from "../../components/reviews/ReviewForm";
import { LiveTrackingMap } from "../../components/tracking/LiveTrackingMap";
import { Card } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import { Button } from "../../components/ui/Button";
import { useLiveLocationSubscription } from "../../hooks/useLiveLocationSubscription";
import { cancelMyPickupRequest, getPickupRequestById, subscribeToPickupRequestById } from "../../services/pickupRequestService";
import { createReview, getReviewByRequest } from "../../services/reviewService";
import { buildOptimisedUrl, getImageUrls } from "../../services/cloudinaryService";
import type { PickupRequest } from "../../types/pickupRequest";
import { getErrorMessage } from "../../utils/errors";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

const categoryLabels: Record<string, string> = {
  newspaper: "Newspaper",
  cardboard: "Cardboard",
  plastic: "Plastic",
  metal: "Metal",
  e_waste: "E-Waste",
  mixed: "Mixed Scrap",
  other: "Other",
};

export function UserRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  async function loadRequest() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getPickupRequestById(id);
      if (!data) { setError("Request not found."); return; }
      setRequest(data);
      if (data.status === "completed") {
        const review = await getReviewByRequest(id);
        setReviewed(Boolean(review));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequest().catch(() => undefined);
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    return subscribeToPickupRequestById(
      id,
      (data) => {
        if (!data) {
          setError("Request not found.");
          return;
        }
        setRequest(data);
      },
      (err) => setError(getErrorMessage(err))
    );
  }, [id]);

  async function handleCancel() {
    if (!request) return;
    setCancelError("");
    setCancelling(true);
    try {
      await cancelMyPickupRequest(request.requestId);
      await loadRequest();
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  async function handleReview(rating: number, comment: string) {
    if (!request?.collectorId) throw new Error("No collector assigned.");
    await createReview({ requestId: request.requestId, collectorId: request.collectorId, rating, comment });
    setReviewed(true);
  }

  const showCollector = request && (request.status === "accepted" || request.status === "completed");
  const liveLocation = useLiveLocationSubscription(
    request?.requestId,
    request?.status === "accepted" && request.trackingEnabled === true
  );

  return (
    <AppLayout title="Request Details">
      <div className="page-container">
        {/* Back button */}
        <button
          onClick={() => navigate("/user/requests")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: MUTED,
            fontSize: 14,
            fontWeight: 600,
            padding: 0,
            marginBottom: 20,
            minHeight: "unset",
          }}
        >
          <ArrowLeft size={16} />
          Back to Requests
        </button>

        {loading && <LoadingSpinner message="Loading request details..." />}
        {error && <ErrorState message={error} onRetry={loadRequest} />}

        {request && (
          <>
            {/* Page heading */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <h1 className="page-title" style={{ fontSize: 20 }}>
                  {categoryLabels[request.category] ?? request.category}
                </h1>
                <p style={{ fontSize: 12, color: MUTED, margin: "4px 0 0" }}>
                  Request #{request.requestId.slice(0, 8)}
                </p>
              </div>
              <RequestStatusBadge status={request.status} large />
            </div>

            {/* Desktop: split layout */}
            <div className="detail-layout">
              {/* Left column: images + details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Images */}
                {getImageUrls(request.images, request.imageUrls).length > 0 && (
                  <Card>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Photos</div>
                    <div className="image-gallery">
                      {getImageUrls(request.images, request.imageUrls).map((url, i) => (
                        <div key={i} className="image-gallery__item">
                          <img src={buildOptimisedUrl(url)} alt={`Scrap image ${i + 1}`} />
                          {request.images?.[i]?.description && (
                            <div className="image-gallery__caption">{request.images[i].description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Details */}
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Request Details</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Category", value: categoryLabels[request.category] },
                      { label: "Quantity", value: request.quantity },
                      { label: "Description", value: request.description },
                      ...(request.aiDetectedCategory ? [{ label: "AI Detected", value: `${request.aiDetectedCategory} (${Math.round((request.aiConfidence ?? 0) * 100)}% confidence)` }] : []),
                      ...(request.expectedPrice != null ? [{ label: "Expected Price", value: `Rs. ${request.expectedPrice}` }] : []),
                      ...(request.finalPrice != null ? [{ label: "Final Price", value: `Rs. ${request.finalPrice}` }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
                        <span style={{ color: MUTED, flexShrink: 0 }}>{label}</span>
                        <span style={{ color: NAVY, fontWeight: 600, textAlign: "right" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Address */}
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <MapPin size={16} color={GREEN} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Pickup Address</div>
                  </div>
                  <div style={{ fontSize: 14, color: NAVY, fontWeight: 600 }}>{request.address.line}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>
                    {request.address.area}, {request.address.city}
                  </div>
                </Card>
              </div>

              {/* Right column: status + actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Status timeline */}
                <Card>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Pickup Progress</div>
                  <StatusTimeline status={request.status} />
                </Card>

                {/* Waiting message for open */}
                {request.status === "open" && (
                  <div className="notice notice-info" style={{ borderRadius: 14 }}>
                    Waiting for a collector to accept your request. Sit tight!
                  </div>
                )}

                {request.status === "accepted" && (
                  <Card>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Collector Location</div>
                    {request.trackingEnabled === true ? (
                      <LiveTrackingMap
                        location={liveLocation.location}
                        pickup={{
                          lat: request.address.lat,
                          lng: request.address.lng,
                          label: `${request.address.line}, ${request.address.area}`,
                        }}
                      />
                    ) : (
                      <div className="notice notice-info">Live tracking is not enabled for this pickup.</div>
                    )}
                  </Card>
                )}

                {(request.status === "completed" || request.status === "cancelled") && (
                  <div className="notice notice-info" style={{ borderRadius: 14 }}>
                    Pickup tracking ended.
                  </div>
                )}

                {/* Collector info */}
                {showCollector && request.collectorId && (
                  <Card>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>Your Collector</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: "#EEEDF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={22} color={NAVY} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{request.collectorName}</div>
                        {request.collectorPhone && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED, marginTop: 4 }}>
                            <Phone size={13} color={MUTED} />
                            <span>{request.collectorPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Cancel button */}
                {request.status === "open" && (
                  <div>
                    {cancelError && (
                      <div className="notice notice-error" style={{ marginBottom: 10, borderRadius: 12 }}>{cancelError}</div>
                    )}
                    <Button
                      variant="danger"
                      size="md"
                      fullWidth
                      loading={cancelling}
                      onClick={handleCancel}
                    >
                      Cancel Request
                    </Button>
                  </div>
                )}

                {/* Review form */}
                {request.status === "completed" && !reviewed && (
                  <Card>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>
                      Rate Your Experience
                    </div>
                    <ReviewForm onSubmit={handleReview} />
                  </Card>
                )}

                {request.status === "completed" && reviewed && (
                  <div className="notice notice-success" style={{ borderRadius: 14, display: "flex", gap: 8, alignItems: "center" }}>
                    <CheckCircle2 size={16} />
                    You've already reviewed this pickup. Thank you!
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
