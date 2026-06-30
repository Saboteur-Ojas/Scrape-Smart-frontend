import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Recycle } from "lucide-react";

const NAVY = "#393666";
const MUTED = "#7B7A9A";
const GREEN = "#82AA68";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const isCollector = profile?.role === "collector";

  return (
    <header className="app-topbar">
      {/* Left: Logo + title */}
      <div className="topbar__left">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${GREEN}, #6B9754)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Recycle size={18} color="#fff" />
        </div>
        <span className="topbar__title">{title ?? "ScrapSmart"}</span>
      </div>

      {/* Right: role badge + profile + logout */}
      <div className="topbar__right">
        {profile && (
          <>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 100,
                background: isCollector ? "#EEEDF8" : "#EAF4E0",
                color: isCollector ? NAVY : "#5A8043",
              }}
            >
              {isCollector ? "Collector" : "User"}
            </span>

            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${GREEN}, #6B9754)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                cursor: "pointer",
              }}
              title={profile.name}
            >
              {profile.name[0]?.toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "1.5px solid rgba(224,82,82,0.3)",
                borderRadius: 10,
                padding: "7px 12px",
                color: "#E05252",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 36,
              }}
            >
              <LogOut size={15} />
              Log Out
            </button>
          </>
        )}
      </div>
    </header>
  );
}
