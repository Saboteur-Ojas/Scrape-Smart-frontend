import { useEffect, useState } from "react";
import { subscribeToLiveLocation } from "../services/liveTrackingService";
import type { LiveLocation } from "../types/liveTracking";

export function useLiveLocationSubscription(requestId?: string, enabled = true) {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestId || !enabled) {
      setLocation(null);
      return undefined;
    }

    setError("");
    const unsubscribe = subscribeToLiveLocation(requestId, setLocation, (err) => setError(err.message));
    return () => unsubscribe();
  }, [requestId, enabled]);

  return { location, error };
}
