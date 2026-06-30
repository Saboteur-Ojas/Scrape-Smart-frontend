import { useCallback, useEffect, useRef, useState } from "react";
import { enableLiveTracking, stopLiveTracking, updateLiveLocation } from "../services/liveTrackingService";
import type { PickupStatus } from "../types/pickupRequest";

const MIN_WRITE_INTERVAL_MS = 10_000;
const MIN_MOVEMENT_METERS = 15;

function distanceMeters(a: GeolocationCoordinates, b: GeolocationCoordinates) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

export function useLiveCollectorTracking(status?: PickupStatus) {
  const watchIdRef = useRef<number | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const lastWriteAtRef = useRef(0);
  const lastCoordsRef = useRef<GeolocationCoordinates | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState("");

  const clearWatch = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  }, []);

  const stopTracking = useCallback(async (requestId?: string) => {
    const targetRequestId = requestId ?? activeRequestIdRef.current;
    clearWatch();
    activeRequestIdRef.current = null;
    lastWriteAtRef.current = 0;
    lastCoordsRef.current = null;
    if (targetRequestId) {
      await stopLiveTracking(targetRequestId);
    }
  }, [clearWatch]);

  const startTracking = useCallback(async (requestId: string) => {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("Location sharing is not supported on this device.");
      return false;
    }

    const initialPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 15_000,
      });
    }).catch((err) => {
      setError(err && typeof err === "object" && "message" in err ? String(err.message) : "Location permission was denied.");
      return null;
    });

    if (!initialPosition) return false;

    await enableLiveTracking(requestId);
    activeRequestIdRef.current = requestId;
    lastWriteAtRef.current = Date.now();
    lastCoordsRef.current = initialPosition.coords;
    await updateLiveLocation(requestId, {
      lat: initialPosition.coords.latitude,
      lng: initialPosition.coords.longitude,
      accuracy: initialPosition.coords.accuracy,
      heading: initialPosition.coords.heading,
      speed: initialPosition.coords.speed,
    });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        const lastCoords = lastCoordsRef.current;
        const movedEnough = !lastCoords || distanceMeters(lastCoords, position.coords) >= MIN_MOVEMENT_METERS;
        const waitedEnough = now - lastWriteAtRef.current >= MIN_WRITE_INTERVAL_MS;

        if (!movedEnough && !waitedEnough) return;

        lastWriteAtRef.current = now;
        lastCoordsRef.current = position.coords;
        updateLiveLocation(requestId, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        }).catch((err) => {
          setError(err instanceof Error ? err.message : "Could not update live location.");
        });
      },
      (err) => {
        setError(err.message || "Location permission was denied.");
        clearWatch();
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 }
    );

    setTracking(true);
    return true;
  }, [clearWatch]);

  useEffect(() => {
    if (status && ["completed", "cancelled"].includes(status)) {
      stopTracking().catch(() => undefined);
    }
  }, [status, stopTracking]);

  useEffect(() => {
    return () => {
      const targetRequestId = activeRequestIdRef.current;
      clearWatch();
      activeRequestIdRef.current = null;
      lastWriteAtRef.current = 0;
      lastCoordsRef.current = null;
      if (targetRequestId) {
        stopLiveTracking(targetRequestId).catch(() => undefined);
      }
    };
  }, [clearWatch]);

  return { tracking, error, startTracking, stopTracking };
}
