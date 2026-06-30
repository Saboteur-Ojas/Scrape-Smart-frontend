import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import {
  ClipboardList,
  Home,
  LogOut,
  Package,
  Recycle,
  Search,
  Truck,
  User,
} from "lucide-react";

const GREEN = "#82AA68";
const NAVY = "#393666";
const MUTED = "#7B7A9A";

const userNav = [
  { to: "/user/dashboard", icon: Home, label: "Dashboard" },
  { to: "/user/create-request", icon: Package, label: "Create Request" },
  { to: "/user/requests", icon: ClipboardList, label: "My Requests" },
  { to: "/user/profile", icon: User, label: "Profile" },
];

const collectorNav = [
  { to: "/collector/dashboard", icon: Home, label: "Dashboard" },
  { to: "/collector/open-requests", icon: Search, label: "Open Requests" },
  { to: "/collector/requests", icon: Truck, label: "My Pickups" },
  { to: "/collector/profile", icon: User, label: "Profile" },
];

export function DesktopSidebar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const isCollector = profile?.role === "collector";
  const navItems = isCollector ? collectorNav : userNav;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="app-sidebar sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Recycle size={22} color="#fff" />
        </div>
        <div>
          <div className="sidebar__logo-name">ScrapSmart</div>
          <div style={{ fontSize: 11, color: MUTED }}>Smart Scrap Pickup</div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ padding: "12px 20px 0" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            background: isCollector ? "#EEEDF8" : "#EAF4E0",
            color: isCollector ? NAVY : "#5A8043",
          }}
        >
          {isCollector ? <Truck size={12} /> : <Home size={12} />}
          {isCollector ? "Collector" : "User"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer: profile + logout */}
      <div className="sidebar__footer">
        {profile && (
          <div className="sidebar__profile">
            <div className="sidebar__avatar">
              {profile.name[0]?.toUpperCase() ?? "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                className="sidebar__profile-name"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.name}
              </div>
              <div
                className="sidebar__profile-role"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="sidebar__nav-item"
          style={{ color: "#E05252" }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
