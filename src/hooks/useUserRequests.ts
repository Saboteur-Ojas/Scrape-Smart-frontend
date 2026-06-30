import { useCallback, useEffect, useState } from "react";
import { getMyPickupRequests } from "../services/pickupRequestService";
import type { PickupRequest } from "../types/pickupRequest";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";

export function useUserRequests() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    if (!profile?.uid) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMyPickupRequests(profile.uid);
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [profile?.uid]);

  useEffect(() => {
    fetchRequests().catch(() => undefined);
  }, [fetchRequests]);

  return { requests, loading, error, refresh: fetchRequests };
}
