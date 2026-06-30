import { Edit2, LogOut, Mail, MapPin, Phone, Save, Star, Truck, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useCollectorRequests } from "../../hooks/useCollectorRequests";
import { updateCollectorProfile } from "../../services/collectorService";
import { getErrorMessage } from "../../utils/errors";
import { requireText, validateServiceAreas } from "../../utils/validation";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

export function CollectorProfilePage() {
  const { profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { collector, assignedRequests, reviews, refresh } = useCollectorRequests();
  const [toggling, setToggling] = useState(false);
  const [toggleMsg, setToggleMsg] = useState("");
  const [editingService, setEditingService] = useState(false);
  const [city, setCity] = useState(profile?.city ?? "");
  const [serviceAreasText, setServiceAreasText] = useState("");
  const [savingService, setSavingService] = useState(false);
  const [serviceMsg, setServiceMsg] = useState("");

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const completedPickupsCount = assignedRequests
    ? assignedRequests.filter((r) => r.status === "completed").length
    : 0;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  async function handleToggleAvailability() {
    if (!collector) return;
    setToggling(true);
    setToggleMsg("");
    try {
      await updateCollectorProfile({
        phone: collector.phone,
        city: collector.city,
        serviceAreas: collector.serviceAreas,
        isAvailable: !collector.isAvailable,
      });
      await refresh();
      setToggleMsg(
        !collector.isAvailable
          ? "You are now available for pickups."
          : "You have paused pickup requests."
      );
    } catch (err) {
      setToggleMsg(getErrorMessage(err));
    } finally {
      setToggling(false);
    }
  }

  function startEditingService() {
    setCity(collector?.city ?? profile?.city ?? "");
    setServiceAreasText((collector?.serviceAreas ?? []).join(", "));
    setServiceMsg("");
    setEditingService(true);
  }

  async function handleSaveService() {
    if (!collector) return;
    setSavingService(true);
    setServiceMsg("");
    try {
      await updateCollectorProfile({
        phone: collector.phone,
        city: requireText(city, "City"),
        serviceAreas: validateServiceAreas(serviceAreasText),
        isAvailable: collector.isAvailable,
      });
      await Promise.all([refresh(), refreshProfile()]);
      setEditingService(false);
      setServiceMsg("Service area updated.");
    } catch (err) {
      setServiceMsg(getErrorMessage(err));
    } finally {
      setSavingService(false);
    }
  }

  if (!profile) return null;

  return (
    <AppLayout title="My Profile">
      <div className="page-container" style={{ maxWidth: 680 }}>
        {/* Avatar header */}
        <div
          style={{
            background: "linear-gradient(160deg, #EEEDF8 0%, #F4F1EB 100%)",
            borderRadius: 24,
            padding: "32px 24px",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${NAVY}, #4A4780)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 8px 24px rgba(57,54,102,0.25)",
              fontSize: 36,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {profile.name[0]?.toUpperCase()}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: "0 0 8px" }}>
            {profile.name}
          </h1>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#EEEDF8",
                borderRadius: 100,
                padding: "4px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: NAVY,
              }}
            >
              <Truck size={13} />
              Collector
            </div>
          </div>
        </div>

        {/* Stats */}
        {collector && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
                <Star size={18} color="#F2A65A" fill="#F2A65A" />
                <span style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>{averageRating.toFixed(1)}</span>
              </div>
              <div className="stat-card__label">Rating</div>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: GREEN, marginBottom: 6 }}>
                {completedPickupsCount}
              </div>
              <div className="stat-card__label">Total Pickups</div>
            </div>
          </div>
        )}

        {/* Contact */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Contact Information</div>
            {collector && !editingService && (
              <Button variant="outline" size="sm" leftIcon={<Edit2 size={14} />} onClick={startEditingService}>
                Edit
              </Button>
            )}
          </div>
          {[
            { icon: Mail, label: "Email", value: profile.email },
            { icon: Phone, label: "Phone", value: profile.phone },
            { icon: MapPin, label: "City", value: profile.city },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(57,54,102,0.06)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F4F1EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color={MUTED} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{value}</div>
              </div>
            </div>
          ))}
        </Card>

        {/* Service areas */}
        {collector && (
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Service Areas</div>
              {!editingService && (
                <Button variant="outline" size="sm" leftIcon={<Edit2 size={14} />} onClick={startEditingService}>
                  Edit
                </Button>
              )}
            </div>
            {editingService ? (
              <div>
                <Input label="City" value={city} onChange={(event) => setCity(event.target.value)} leftIcon={<MapPin size={16} />} />
                <Input
                  label="Localities"
                  value={serviceAreasText}
                  onChange={(event) => setServiceAreasText(event.target.value)}
                  leftIcon={<MapPin size={16} />}
                  hint="Separate localities with commas."
                />
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <Button size="sm" leftIcon={<Save size={14} />} loading={savingService} onClick={handleSaveService}>
                    Save
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<X size={14} />} onClick={() => setEditingService(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {collector.serviceAreas.map((area) => (
                  <span
                    key={area}
                    style={{
                      background: "#EEEDF8",
                      color: NAVY,
                      borderRadius: 100,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
            {serviceMsg && (
              <div className={`notice ${serviceMsg === "Service area updated." ? "notice-success" : "notice-error"}`} style={{ marginTop: 12, borderRadius: 10 }}>
                {serviceMsg}
              </div>
            )}
          </Card>
        )}

        {/* Availability toggle */}
        {collector && (
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Availability</div>
                <div style={{ fontSize: 12, color: collector.isAvailable ? GREEN : MUTED, marginTop: 4 }}>
                  {collector.isAvailable ? "Accepting pickup requests" : "Not accepting pickups"}
                </div>
              </div>
              <Button
                variant={collector.isAvailable ? "outline" : "primary"}
                size="sm"
                loading={toggling}
                onClick={handleToggleAvailability}
              >
                {collector.isAvailable ? "Pause" : "Go Live"}
              </Button>
            </div>
            {toggleMsg && (
              <div className="notice notice-success" style={{ marginTop: 12, borderRadius: 10 }}>
                {toggleMsg}
              </div>
            )}
          </Card>
        )}

        {/* Recent reviews */}
        {reviews.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Recent Reviews</div>
            {reviews.slice(0, 3).map((review) => (
              <div key={review.reviewId} style={{ padding: "10px 0", borderBottom: "1px solid rgba(57,54,102,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#F2A65A", fontSize: 13, fontWeight: 700 }}>
                  <Star size={14} fill="#F2A65A" color="#F2A65A" />
                  {review.rating}/5
                </div>
                {review.comment && (
                  <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0", lineHeight: 1.5 }}>{review.comment}</p>
                )}
              </div>
            ))}
          </Card>
        )}

        {/* Logout */}
        <Button variant="danger" size="md" fullWidth leftIcon={<LogOut size={16} />} onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </AppLayout>
  );
}
