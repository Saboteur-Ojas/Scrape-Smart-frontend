import type { PickupRequest } from "../../types/pickupRequest";
import { RequestCard } from "../requests/RequestCard";

interface CollectorRequestCardProps {
  request: PickupRequest;
  onView?: () => void;
  onAccept?: () => Promise<void> | void;
  accepting?: boolean;
  showAccept?: boolean;
}

export function CollectorRequestCard({
  request,
  onView,
  onAccept,
  accepting = false,
  showAccept = false,
}: CollectorRequestCardProps) {
  const acceptBtn = showAccept && onAccept ? (
    <button
      disabled={accepting}
      onClick={(e) => {
        e.stopPropagation();
        onAccept();
      }}
      className="btn btn-primary btn-sm"
      style={{ opacity: accepting ? 0.6 : 1 }}
    >
      {accepting ? "Accepting..." : "Accept"}
    </button>
  ) : null;

  return <RequestCard request={request} onView={onView} actions={acceptBtn} />;
}
