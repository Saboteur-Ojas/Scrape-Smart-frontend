import type { ReactNode } from "react";
import type { PickupStatus } from "../../types/pickupRequest";
import { getStatusTone, statusLabels } from "../../utils/status";

interface BadgeProps {
  status: PickupStatus;
}

export function StatusBadge({ status }: BadgeProps) {
  const tone = getStatusTone(status);
  return (
    <span
      className="badge"
      style={{ color: tone.color, background: tone.bg }}
    >
      {statusLabels[status]}
    </span>
  );
}

interface GenericBadgeProps {
  children: ReactNode;
  variant?: "verified" | "pending" | "info" | "error";
}

export function Badge({ children, variant = "info" }: GenericBadgeProps) {
  const colorMap = {
    verified: { color: "#82AA68", bg: "#EAF4E0" },
    pending: { color: "#D4880A", bg: "#FDF3E7" },
    info: { color: "#393666", bg: "#EEEDF8" },
    error: { color: "#E05252", bg: "#FFF0F0" },
  };
  const c = colorMap[variant];
  return (
    <span className="badge" style={{ color: c.color, background: c.bg }}>
      {children}
    </span>
  );
}
