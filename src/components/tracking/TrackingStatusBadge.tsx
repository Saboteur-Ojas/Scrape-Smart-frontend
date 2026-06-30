import { Navigation, NavigationOff } from "lucide-react";

interface TrackingStatusBadgeProps {
  enabled: boolean;
}

export function TrackingStatusBadge({ enabled }: TrackingStatusBadgeProps) {
  return (
    <span className={`tracking-status ${enabled ? "tracking-status--on" : "tracking-status--off"}`}>
      {enabled ? <Navigation size={13} /> : <NavigationOff size={13} />}
      {enabled ? "Live tracking on" : "Live tracking off"}
    </span>
  );
}
