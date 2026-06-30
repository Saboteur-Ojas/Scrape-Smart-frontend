import { NavLink } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { ClipboardList, Home, Package, Search, Truck, User } from "lucide-react";

const userNav = [
  { to: "/user/dashboard", icon: Home, label: "Home" },
  { to: "/user/create-request", icon: Package, label: "Create" },
  { to: "/user/requests", icon: ClipboardList, label: "Requests" },
  { to: "/user/profile", icon: User, label: "Profile" },
];

const collectorNav = [
  { to: "/collector/dashboard", icon: Home, label: "Home" },
  { to: "/collector/open-requests", icon: Search, label: "Open" },
  { to: "/collector/requests", icon: Truck, label: "My Pickups" },
  { to: "/collector/profile", icon: User, label: "Profile" },
];

export function MobileBottomNav() {
  const { profile } = useAuth();
  const isCollector = profile?.role === "collector";
  const navItems = isCollector ? collectorNav : userNav;

  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `mobile-bottom-nav__item ${isActive ? "active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="mobile-bottom-nav__label">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
