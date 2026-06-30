import type { PickupStatus } from "../types/pickupRequest";

export const statusLabels: Record<PickupStatus, string> = {
  open: "Open",
  accepted: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function getStatusTone(status: PickupStatus) {
  if (status === "completed") return { color: "#82AA68", bg: "#EAF4E0" };
  if (status === "accepted") return { color: "#D4880A", bg: "#FDF3E7" };
  if (status === "cancelled") return { color: "#E05252", bg: "#FFF0F0" };
  return { color: "#7B7A9A", bg: "#F3F3F3" };
}
