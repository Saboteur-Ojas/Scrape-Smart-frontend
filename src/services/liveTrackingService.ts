import { doc, onSnapshot } from "firebase/firestore";
import { auth } from "../lib/firebase/auth";
import { db } from "../lib/firebase/firestore";
import type { LiveLocation, LiveLocationInput } from "../types/liveTracking";
import { apiFetch } from "./apiClient";
import { getPickupRequestById } from "./pickupRequestService";

function collectorRef(collectorId: string) {
  return doc(db, "collectors", collectorId);
}

async function getAcceptedAssignedRequest(requestId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Login required.");

  const request = await getPickupRequestById(requestId);
  if (!request) throw new Error("Pickup request was not found.");
  if (request.status !== "accepted") throw new Error("Live tracking is available only for accepted pickups.");
  if (request.collectorId !== uid) throw new Error("Only the assigned collector can share live location.");

  return request;
}

export async function enableLiveTracking(requestId: string) {
  await getAcceptedAssignedRequest(requestId);
  await apiFetch(`/api/requests/${requestId}/tracking`, {
    method: "POST",
    body: JSON.stringify({ enabled: true }),
  });
}

export async function updateLiveLocation(requestId: string, location: LiveLocationInput) {
  await getAcceptedAssignedRequest(requestId);
  await apiFetch("/api/collector/location", {
    method: "POST",
    body: JSON.stringify(location),
  });
}

export async function stopLiveTracking(requestId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Login required.");
  await apiFetch(`/api/requests/${requestId}/tracking`, {
    method: "POST",
    body: JSON.stringify({ enabled: false }),
  });
}

export function subscribeToLiveLocation(
  requestId: string,
  callback: (location: LiveLocation | null) => void,
  onError?: (error: Error) => void
) {
  let unsubscribe: () => void = () => undefined;
  let cancelled = false;

  getPickupRequestById(requestId).then((request) => {
    if (cancelled) return;
    if (!request?.collectorId) {
      callback(null);
      return;
    }

    unsubscribe = onSnapshot(
      collectorRef(request.collectorId),
      (snapshot) => {
        const collector = snapshot.exists() ? snapshot.data() : null;
        const currentLocation = collector?.currentLocation;
        if (
          !currentLocation
          || typeof currentLocation.lat !== "number"
          || typeof currentLocation.lng !== "number"
        ) {
          callback(null);
          return;
        }

        callback({
          requestId,
          collectorId: request.collectorId!,
          userId: request.userId,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: currentLocation.accuracy ?? undefined,
          heading: currentLocation.heading ?? null,
          speed: currentLocation.speed ?? null,
          updatedAt: currentLocation.updatedAt,
          active: request.status === "accepted",
        });
      },
      onError
    );
  }).catch((err) => {
    callback(null);
    onError?.(err instanceof Error ? err : new Error("Could not subscribe to live location."));
  });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}
