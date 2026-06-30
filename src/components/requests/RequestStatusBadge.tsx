import type { PickupStatus } from "../../types/pickupRequest";
import { getStatusTone, statusLabels } from "../../utils/status";

interface RequestStatusBadgeProps {
  status: PickupStatus;
  large?: boolean;
}

export function RequestStatusBadge({ status, large = false }: RequestStatusBadgeProps) {
  const tone = getStatusTone(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: large ? "6px 14px" : "4px 10px",
        borderRadius: 100,
        fontSize: large ? 13 : 11,
        fontWeight: 700,
        color: tone.color,
        background: tone.bg,
        whiteSpace: "nowrap",
      }}
    >
      {statusLabels[status]}
    </span>
  );
}
