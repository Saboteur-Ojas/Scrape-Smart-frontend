import { useCallback, useEffect, useState } from "react";
import {
  getAssignedCollectorRequests,
  getCollectorProfile,
  getCityPickupRequestsForCollector,
} from "../services/collectorService";
import { getCollectorReviews } from "../services/reviewService";
import type { CollectorProfile } from "../types/collector";
import type { PickupRequest } from "../types/pickupRequest";
import type { Review } from "../types/review";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/errors";

export function useCollectorRequests() {
  const { profile } = useAuth();
  const [collector, setCollector] = useState<CollectorProfile | null>(null);
  const [openRequests, setOpenRequests] = useState<PickupRequest[]>([]);
  const [acceptedCityRequests, setAcceptedCityRequests] = useState<PickupRequest[]>([]);
  const [assignedRequests, setAssignedRequests] = useState<PickupRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    if (!profile?.uid || profile.role !== "collector") return;
    setLoading(true);
    setError("");
    try {
      const collectorProfile = await getCollectorProfile(profile.uid);
      setCollector(collectorProfile);
      if (!collectorProfile) {
        throw new Error("Collector profile not found. Please complete your collector registration.");
      }
      if (!collectorProfile.cityNormalized?.trim() && !collectorProfile.city?.trim()) {
        throw new Error("City is missing from your collector profile. Please update your profile.");
      }
      const [cityRequests, assigned, revs] = await Promise.all([
        getCityPickupRequestsForCollector(profile.uid, collectorProfile),
        getAssignedCollectorRequests(profile.uid),
        getCollectorReviews(profile.uid),
      ]);
      setOpenRequests(cityRequests.open);
      setAcceptedCityRequests(cityRequests.accepted);
      setAssignedRequests(assigned);
      setReviews(revs);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [profile?.uid, profile?.role]);

  useEffect(() => {
    fetchAll().catch(() => undefined);

    // Auto-refresh every 30 seconds so new requests appear without manual reload
    const interval = setInterval(() => {
      fetchAll().catch(() => undefined);
    }, 30_000);

    return () => clearInterval(interval);
  }, [fetchAll]);

  return {
    collector,
    openRequests,
    acceptedCityRequests,
    assignedRequests,
    reviews,
    loading,
    error,
    refresh: fetchAll,
  };
}
