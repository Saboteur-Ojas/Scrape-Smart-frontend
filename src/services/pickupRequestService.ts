import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth } from "../lib/firebase/auth";
import { db } from "../lib/firebase/firestore";
import type { CreatePickupRequestInput, PickupRequest } from "../types/pickupRequest";
import { cleanCity, normalizeCity } from "../utils/validation";
import { geocodeAddress } from "./geoapifyRoutingService";
import { apiFetch } from "./apiClient";

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefined(item)) as T;
  }

  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefined(item)])
    ) as T;
  }

  return value;
}

export async function createPickupRequest(input: CreatePickupRequestInput) {
  if (!auth.currentUser || auth.currentUser.uid !== input.userId) throw new Error("You can create only your own pickup request.");
  
  const city = cleanCity(input.address.city);
  const cityNormalized = normalizeCity(input.address.city);
  const address = {
    ...input.address,
    line: input.address.line.trim(),
    area: input.address.area.trim(),
    city,
  };
  let pickupLocation =
    typeof input.pickupLocation?.lat === "number" && typeof input.pickupLocation.lng === "number"
      ? input.pickupLocation
      : typeof address.lat === "number" && typeof address.lng === "number"
        ? { lat: address.lat, lng: address.lng }
        : null;

  if (!pickupLocation) {
    try {
      pickupLocation = await geocodeAddress(`${address.line}, ${address.area}, ${city}`);
    } catch (err) {
      console.warn("Pickup address geocoding failed; saving request without coordinates.", err);
    }
  }

  address.lat = pickupLocation?.lat ?? null;
  address.lng = pickupLocation?.lng ?? null;

  const primaryImage = input.images[0];
  if (!primaryImage?.url || !primaryImage.publicId) {
    throw new Error("Upload at least one Cloudinary image before creating a request.");
  }

  const data = removeUndefined({
    city,
    cityNormalized,
    pickupAddress: `${address.line}, ${address.area}, ${address.city}`,
    address,
    scrapCategory: input.category,
    category: input.category,
    quantity: input.quantity,
    description: input.description,
    location: pickupLocation,
    pickupLocation,
    pickupLat: pickupLocation?.lat ?? null,
    pickupLng: pickupLocation?.lng ?? null,
    images: input.images,
    imageUrls: input.images.map((image) => image.url),
    imageUrl: primaryImage.url,
    imagePublicId: primaryImage.publicId,
    aiDetectedCategory: input.aiDetectedCategory,
    aiConfidence: input.aiConfidence,
    aiNotes: input.aiNotes,
    expectedPrice: input.expectedPrice,
  });
  const response = await apiFetch<{ requestId: string }>("/api/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.requestId;
}

export async function getMyPickupRequests(userId: string) {
  if (!auth.currentUser || auth.currentUser.uid !== userId) throw new Error("You can read only your own requests.");
  const data = await apiFetch<PickupRequest[] | null>("/api/user/my-requests");
  return Array.isArray(data) ? data.map(normalizeRequest) : [];
}

export async function getPickupRequestById(requestId: string) {
  try {
    const data = await apiFetch<PickupRequest>(`/api/requests/${requestId}`);
    return normalizeRequest(data);
  } catch {
    const snapshot = await getDoc(doc(db, "requests", requestId));
    return snapshot.exists() ? normalizeRequest(snapshot.data() as PickupRequest) : null;
  }
}

export function subscribeToPickupRequestById(
  requestId: string,
  callback: (request: PickupRequest | null) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(db, "requests", requestId),
    (snapshot) => callback(snapshot.exists() ? normalizeRequest(snapshot.data() as PickupRequest) : null),
    onError
  );
}

export async function cancelMyPickupRequest(requestId: string) {
  await apiFetch(`/api/requests/${requestId}/cancel`, { method: "POST" });
}

export function normalizeRequest(request: PickupRequest): PickupRequest {
  const category = (request.category ?? request.scrapCategory ?? "other") as PickupRequest["category"];
  const imageUrl = request.imageUrl ?? request.imageUrls?.[0] ?? request.images?.[0]?.url;
  const [line = request.pickupAddress ?? "", area = "", addressCity = request.city] = (request.pickupAddress ?? "")
    .split(",")
    .map((part) => part.trim());
  const location = request.location ?? request.pickupLocation ?? null;

  return {
    ...request,
    category,
    scrapCategory: category,
    images: request.images ?? (imageUrl && request.imagePublicId ? [{ url: imageUrl, publicId: request.imagePublicId }] : []),
    imageUrl,
    imageUrls: request.imageUrls ?? (imageUrl ? [imageUrl] : []),
    address: request.address ?? {
      line,
      area,
      city: addressCity,
      lat: location?.lat ?? null,
      lng: location?.lng ?? null,
    },
    pickupLocation: request.pickupLocation ?? location,
    pickupLat: request.pickupLat ?? location?.lat ?? null,
    pickupLng: request.pickupLng ?? location?.lng ?? null,
    collectorName: request.collectorName ?? null,
    expectedPrice: request.expectedPrice ?? null,
    finalPrice: request.finalPrice ?? null,
    trackingEnabled: request.trackingEnabled ?? false,
  };
}
