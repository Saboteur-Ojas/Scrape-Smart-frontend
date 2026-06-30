import { Award, ClipboardList, Edit2, LogOut, Mail, MapPin, Phone, Save, User, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useUserRequests } from "../../hooks/useUserRequests";
import { updateUserLocation } from "../../services/authService";
import { getErrorMessage } from "../../utils/errors";
import { requireText } from "../../utils/validation";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

export function UserProfilePage() {
  const { profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { requests } = useUserRequests();
  const [editingLocation, setEditingLocation] = useState(false);
  const [city, setCity] = useState(profile?.city ?? "");
  const [area, setArea] = useState(profile?.area ?? "");
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");

  const completed = requests.filter((r) => r.status === "completed").length;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function startEditingLocation() {
    setCity(profile?.city ?? "");
    setArea(profile?.area ?? "");
    setLocationMsg("");
    setEditingLocation(true);
  }

  async function handleSaveLocation() {
    setSavingLocation(true);
    setLocationMsg("");
    try {
      await updateUserLocation({
        city: requireText(city, "City"),
        area: requireText(area, "Locality"),
      });
      await refreshProfile();
      setEditingLocation(false);
      setLocationMsg("Location updated.");
    } catch (err) {
      setLocationMsg(getErrorMessage(err));
    } finally {
      setSavingLocation(false);
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
              background: `linear-gradient(135deg, ${GREEN}, #6B9754)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: `0 8px 24px rgba(130,170,104,0.35)`,
              fontSize: 36,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {profile.name[0]?.toUpperCase()}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: "0 0 6px" }}>
            {profile.name}
          </h1>
          <div
            style={{
              display: "inline-block",
              background: "#EAF4E0",
              color: "#5A8043",
              borderRadius: 100,
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            User Account
          </div>
        </div>

        {/* Contact info */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
              Contact Information
            </div>
            {!editingLocation && (
              <Button variant="outline" size="sm" leftIcon={<Edit2 size={14} />} onClick={startEditingLocation}>
                Edit
              </Button>
            )}
          </div>

          {editingLocation ? (
            <div>
              <Input label="City" value={city} onChange={(event) => setCity(event.target.value)} leftIcon={<MapPin size={16} />} />
              <Input label="Locality" value={area} onChange={(event) => setArea(event.target.value)} leftIcon={<MapPin size={16} />} />
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <Button size="sm" leftIcon={<Save size={14} />} loading={savingLocation} onClick={handleSaveLocation}>
                  Save
                </Button>
                <Button variant="outline" size="sm" leftIcon={<X size={14} />} onClick={() => setEditingLocation(false)}>
                  Cancel
                </Button>
              </div>
              {locationMsg && (
                <div className={`notice ${locationMsg === "Location updated." ? "notice-success" : "notice-error"}`} style={{ marginTop: 12, borderRadius: 10 }}>
                  {locationMsg}
                </div>
              )}
            </div>
          ) : (
            <>
              {[
                { icon: Mail, label: "Email", value: profile.email },
                { icon: Phone, label: "Phone", value: profile.phone },
                { icon: MapPin, label: "City", value: profile.city },
                ...(profile.area ? [{ icon: MapPin, label: "Locality", value: profile.area }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(57,54,102,0.06)" }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#F4F1EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color={MUTED} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{value}</div>
                  </div>
                </div>
              ))}
              {locationMsg && (
                <div className="notice notice-success" style={{ marginTop: 12, borderRadius: 10 }}>
                  {locationMsg}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Stats */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14 }}>
            Your Impact
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ textAlign: "center", background: "#EAF4E0", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: GREEN }}>{completed}</div>
              <div style={{ fontSize: 12, color: MUTED }}>Pickups Done</div>
            </div>
            <div style={{ textAlign: "center", background: "#E6F8F7", borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#5BBFB5" }}>{completed * 8} kg</div>
              <div style={{ fontSize: 12, color: MUTED }}>Recycled</div>
            </div>
          </div>
        </Card>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => navigate("/user/requests")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#fff",
              border: "1px solid rgba(57,54,102,0.08)",
              borderRadius: 16,
              padding: "14px 16px",
              cursor: "pointer",
              width: "100%",
              minHeight: "unset",
              textAlign: "left",
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "#EEEDF8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList size={18} color={NAVY} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>Pickup History</span>
          </button>

          <button
            onClick={() => navigate("/user/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#fff",
              border: "1px solid rgba(57,54,102,0.08)",
              borderRadius: 16,
              padding: "14px 16px",
              cursor: "pointer",
              width: "100%",
              minHeight: "unset",
              textAlign: "left",
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "#EAF4E0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={18} color={GREEN} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>Eco Impact</span>
          </button>
        </div>

        {/* Logout */}
        <Button variant="danger" size="md" fullWidth leftIcon={<LogOut size={16} />} onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </AppLayout>
  );
}
