import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth } from "../lib/firebase/auth";
import { db } from "../lib/firebase/firestore";
import type { CollectorProfile, UpdateCollectorProfileInput } from "../types/collector";
import type { PickupRequest } from "../types/pickupRequest";
import { cleanCity, normalizeCity } from "../utils/validation";
import { apiFetch } from "./apiClient";
import { normalizeRequest } from "./pickupRequestService";

export async function getCollectorProfile(collectorId: string) {
  const snapshot = await getDoc(doc(db, "collectors", collectorId));
  return snapshot.exists() ? (snapshot.data() as CollectorProfile) : null;
}

function getCollectorCityNormalized(collector: CollectorProfile) {
  return collector.cityNormalized?.trim().toLowerCase() || (collector.city ? normalizeCity(collector.city) : "");
}

function getMillis(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().getTime();
  }
  return value ? new Date(value as string | number).getTime() : 0;
}

export async function updateCollectorProfile(input: UpdateCollectorProfileInput) {
  if (!auth.currentUser) throw new Error("Login required.");
  const uid = auth.currentUser.uid;
  const current = await getCollectorProfile(uid);
  if (!current) throw new Error("Collector profile not found.");

  const cleanedCity = cleanCity(input.city);
  const cityNormalized = normalizeCity(input.city);

  const batch = writeBatch(db);
  batch.update(doc(db, "users", uid), {
    phone: input.phone.trim(),
    city: cleanedCity,
    cityNormalized,
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, "collectors", uid), {
    phone: input.phone.trim(),
    city: cleanedCity,
    cityNormalized,
    serviceCity: cleanedCity,
    serviceAreas: input.serviceAreas,
    isAvailable: input.isAvailable,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function getCityPickupRequestsForCollector(collectorId: string, collectorProfile?: CollectorProfile | null) {
  const collector = collectorProfile ?? await getCollectorProfile(collectorId);
  if (!collector) throw new Error("Collector profile not found. Please complete your collector registration.");
  if (!collector.isAvailable) return { open: [], accepted: [] };

  if (!collector.serviceCity && !getCollectorCityNormalized(collector)) {
    throw new Error("Service city is missing from your collector profile. Please update your profile.");
  }

  const cityQuery = getCollectorCityNormalized(collector);
  const open = (await apiFetch<PickupRequest[]>(`/api/collector/open-requests?city=${encodeURIComponent(cityQuery)}`)).map(normalizeRequest);

  return {
    open,
    accepted: [],
  };
}

/** @deprecated Use getCityPickupRequestsForCollector instead */
export async function getOpenPickupRequestsForCollector(collectorId: string) {
  const { open } = await getCityPickupRequestsForCollector(collectorId);
  return open;
}

export async function getAssignedCollectorRequests(collectorId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== collectorId) throw new Error("You can read only your own pickups.");
  const assigned = (await apiFetch<PickupRequest[]>("/api/collector/my-pickups")).map(normalizeRequest);
  return assigned.sort((a, b) => {
    return getMillis(b.updatedAt) - getMillis(a.updatedAt);
  });
}

function requireCollectorUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Login required.");
  return uid;
}

export async function acceptPickupRequest(requestId: string) {
  requireCollectorUid();
  const uid = auth.currentUser?.uid || "prototype_collector";
  return apiFetch<{ requestId: string; status: "accepted" }>(`/api/requests/${requestId}/accept`, {
    method: "POST",
    body: JSON.stringify({ collectorId: uid, collectorName: "Prototype Collector" })
  });
}

export async function completePickupRequest(requestId: string, finalPrice?: number) {
  requireCollectorUid();
  return apiFetch<{ requestId: string; status: "completed" }>(`/api/requests/${requestId}/complete`, {
    method: "POST",
    body: JSON.stringify({ finalPrice }),
  });
}

export async function cancelAcceptedRequestByCollector(requestId: string) {
  requireCollectorUid();
  return apiFetch<{ requestId: string; status: "cancelled" }>(`/api/requests/${requestId}/cancel`, { method: "POST" });
}
