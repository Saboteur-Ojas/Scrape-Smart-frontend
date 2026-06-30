import { ArrowLeft, CheckCircle2, Clock, Home, MapPin, Navigation, NavigationOff, Phone, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { RequestStatusBadge } from "../../components/requests/RequestStatusBadge";
import { LiveTrackingMap } from "../../components/tracking/LiveTrackingMap";
import { LiveTrackingPrompt } from "../../components/tracking/LiveTrackingPrompt";
import { TrackingStatusBadge } from "../../components/tracking/TrackingStatusBadge";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import { useLiveCollectorTracking } from "../../hooks/useLiveCollectorTracking";
import { useLiveLocationSubscription } from "../../hooks/useLiveLocationSubscription";
import { getPickupRequestById } from "../../services/pickupRequestService";
import { completePickupRequest, cancelAcceptedRequestByCollector } from "../../services/collectorService";
import { geocodeAddress } from "../../services/geoapifyRoutingService";
import { buildOptimisedUrl, getImageUrls } from "../../services/cloudinaryService";
import type { PickupRequest } from "../../types/pickupRequest";
import type { LiveLocation } from "../../types/liveTracking";
import { getErrorMessage } from "../../utils/errors";
import { validateFinalPrice } from "../../utils/validation";
import { useAuth } from "../../context/AuthContext";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

const categoryLabels: Record<string, string> = {
  newspaper: "Newspaper", cardboard: "Cardboard", plastic: "Plastic",
  metal: "Metal", e_waste: "E-Waste", mixed: "Mixed Scrap", other: "Other",
};

export function CollectorRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [showTrackingPrompt, setShowTrackingPrompt] = useState(Boolean(location.state?.promptLiveTracking));
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [routeLocation, setRouteLocation] = useState<LiveLocation | null>(null);
  const [pickupRoutePoint, setPickupRoutePoint] = useState<{ lat: number; lng: number } | null>(null);
  const [routeBusy, setRouteBusy] = useState(false);
  const [routeError, setRouteError] = useState("");
  const tracking = useLiveCollectorTracking(request?.status);
  const liveLocation = useLiveLocationSubscription(
    request?.requestId,
    request?.status === "accepted" && request.trackingEnabled === true
  );

  async function loadRequest() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getPickupRequestById(id);
      if (!data) { setError("Request not found."); return; }
      setRequest(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRequest().catch(() => undefined); }, [id]);

  useEffect(() => {
    if (request?.status !== "accepted") setShowTrackingPrompt(false);
  }, [request?.status]);

  useEffect(() => {
    if (!request) {
      setPickupRoutePoint(null);
      return;
    }

    const existingPoint =
      typeof request.pickupLocation?.lat === "number" && typeof request.pickupLocation.lng === "number"
        ? request.pickupLocation
        : typeof request.pickupLat === "number" && typeof request.pickupLng === "number"
          ? { lat: request.pickupLat, lng: request.pickupLng }
          : typeof request.address.lat === "number" && typeof request.address.lng === "number"
            ? { lat: request.address.lat, lng: request.address.lng }
            : null;

    if (existingPoint) {
      setPickupRoutePoint(existingPoint);
      return;
    }

    geocodeAddress(`${request.address.line}, ${request.address.area}, ${request.address.city}`)
      .then((point) => setPickupRoutePoint(point))
      .catch((err) => {
        console.error("Pickup address geocoding failed", err);
        setPickupRoutePoint(null);
      });
  }, [request]);

  async function handleShowRoute() {
    if (!request) return;
    setRouteBusy(true);
    setRouteError("");
    if (!navigator.geolocation) {
      setRouteError("Location permission is required to show route to pickup address.");
      setRouteBusy(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRouteLocation({
          requestId: request.requestId,
          collectorId: profile?.uid ?? "",
          userId: request.userId,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          updatedAt: new Date(),
          active: true,
        });
        setRouteBusy(false);
      },
      (err) => {
        console.error("Collector location permission/error", err);
        setRouteError("Location permission is required to show route to pickup address.");
        setRouteBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 }
    );
  }

  async function handleEnableTracking() {
    if (!request) return;
    setTrackingBusy(true);
    setActionError("");
    try {
      const started = await tracking.startTracking(request.requestId);
      if (started) {
        setShowTrackingPrompt(false);
        await loadRequest();
      }
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setTrackingBusy(false);
    }
  }

  async function handleStopTracking() {
    if (!request) return;
    setTrackingBusy(true);
    setActionError("");
    try {
      await tracking.stopTracking(request.requestId);
      await loadRequest();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setTrackingBusy(false);
    }
  }

  async function handleComplete() {
    if (!request) return;
    setActionError("");
    try {
      const price = finalPrice.trim() ? validateFinalPrice(finalPrice) : undefined;
      setBusy("Completing pickup...");
      await completePickupRequest(request.requestId, price);
      await loadRequest();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function handleCancelAssignment() {
    if (!request) return;
    setActionError("");
    setBusy("Cancelling assignment...");
    try {
      await cancelAcceptedRequestByCollector(request.requestId);
      navigate("/collector/requests", { replace: true });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy("");
    }
  }

  return (
    <AppLayout title="Pickup Details">
      <div className="page-container">
        <LiveTrackingPrompt
          open={showTrackingPrompt && request?.status === "accepted"}
          loading={trackingBusy}
          error={tracking.error || actionError}
          onEnable={handleEnableTracking}
          onSkip={() => setShowTrackingPrompt(false)}
        />

        {/* Back */}
        <button
          onClick={() => navigate("/collector/requests")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 20, minHeight: "unset" }}
        >
          <ArrowLeft size={16} />
          Back to My Pickups
        </button>

        {loading && <LoadingSpinner message="Loading pickup details..." />}
        {error && <ErrorState message={error} onRetry={loadRequest} />}

        {request && (
          <>
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

            <div className="detail-layout">
              {/* Left: Images + details */}
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Scrap Details</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Category", value: categoryLabels[request.category] },
                      { label: "Quantity", value: request.quantity },
                      { label: "Description", value: request.description },
                      ...(request.aiDetectedCategory ? [{ label: "AI Detected", value: `${request.aiDetectedCategory} (${Math.round((request.aiConfidence ?? 0) * 100)}%)` }] : []),
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

                {/* Customer info */}
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <User size={16} color={NAVY} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Customer</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{request.userName}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <Phone size={13} color={MUTED} />
                    <span style={{ fontSize: 13, color: MUTED }}>{request.userPhone}</span>
                  </div>
                </Card>

                {/* Address */}
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <MapPin size={16} color={GREEN} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Pickup Address</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{request.address.line}</div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                    {request.address.area}, {request.address.city}
                  </div>
                </Card>
              </div>

              {/* Right: Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {actionError && (
                  <div className="notice notice-error" style={{ borderRadius: 14 }}>{actionError}</div>
                )}
                {busy && (
                  <div className="notice notice-info" style={{ borderRadius: 14, display: "flex", gap: 8, alignItems: "center" }}>
                    <Clock size={15} /> {busy}
                  </div>
                )}
                {tracking.error && (
                  <div className="notice notice-error" style={{ borderRadius: 14 }}>{tracking.error}</div>
                )}

                {request.status === "accepted" && (
                  <Card>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Route to Pickup</div>
                    <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 12 }}>
                      Use your current location to get directions to the customer pickup address.
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={routeBusy}
                      disabled={routeBusy}
                      onClick={handleShowRoute}
                      leftIcon={<Navigation size={15} />}
                      style={{ marginBottom: 12 }}
                    >
                      Show Route
                    </Button>
                    {routeError && <div className="notice notice-error" style={{ borderRadius: 14, marginBottom: 12 }}>{routeError}</div>}
                    {routeLocation && (
                      <LiveTrackingMap
                        location={routeLocation}
                        pickup={{
                          lat: pickupRoutePoint?.lat,
                          lng: pickupRoutePoint?.lng,
                          label: `${request.address.line}, ${request.address.area}`,
                        }}
                      />
                    )}
                    {!pickupRoutePoint && (
                      <div className="notice notice-warning" style={{ marginTop: 12 }}>
                        Pickup coordinates are missing. Check the saved address before starting navigation.
                      </div>
                    )}
                  </Card>
                )}

                {request.status === "accepted" && (
                  <Card>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Live Tracking</div>
                      <TrackingStatusBadge enabled={tracking.tracking || request.trackingEnabled === true} />
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 12 }}>
                      Share your current location with the user for this pickup. Tracking is optional and stops after pickup.
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={trackingBusy}
                        disabled={tracking.tracking || request.trackingEnabled === true}
                        onClick={handleEnableTracking}
                        leftIcon={<Navigation size={15} />}
                      >
                        Enable Live Tracking
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        loading={trackingBusy}
                        disabled={!tracking.tracking && request.trackingEnabled !== true}
                        onClick={handleStopTracking}
                        leftIcon={<NavigationOff size={15} />}
                      >
                        Stop Live Tracking
                      </Button>
                    </div>
                    {request.trackingEnabled === true && (
                      <div style={{ marginTop: 14 }}>
                        <LiveTrackingMap
                          location={liveLocation.location}
                          pickup={{
                            lat: request.address.lat,
                            lng: request.address.lng,
                            label: `${request.address.line}, ${request.address.area}`,
                          }}
                        />
                      </div>
                    )}
                  </Card>
                )}

                {/* Complete or cancel accepted pickup */}
                {request.status === "accepted" && (
                  <Card>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Complete Pickup</div>
                    <Input
                      label="Final Price (Rs.)"
                      type="number"
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(e.target.value)}
                      placeholder="Enter amount paid to customer"
                      leftIcon={<TrendingUp size={17} />}
                      hint="Optional for hackathon demo"
                    />
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      loading={busy === "Completing pickup..."}
                      disabled={!!busy}
                      onClick={handleComplete}
                      leftIcon={<Home size={16} />}
                      style={{ marginBottom: 10 }}
                    >
                      Complete Pickup
                    </Button>
                    <Button
                      variant="danger"
                      size="md"
                      fullWidth
                      loading={busy === "Cancelling assignment..."}
                      disabled={!!busy}
                      onClick={handleCancelAssignment}
                    >
                      Cancel Assignment
                    </Button>
                  </Card>
                )}

                {/* Completed badge */}
                {request.status === "completed" && (
                  <div
                    style={{
                      background: "#EAF4E0",
                      borderRadius: 18,
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      textAlign: "center",
                    }}
                  >
                    <CheckCircle2 size={40} color={GREEN} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Pickup Completed!</div>
                    {request.finalPrice != null && (
                      <div style={{ fontSize: 14, color: MUTED }}>
                        Final amount: <strong style={{ color: NAVY }}>Rs. {request.finalPrice}</strong>
                      </div>
                    )}
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
