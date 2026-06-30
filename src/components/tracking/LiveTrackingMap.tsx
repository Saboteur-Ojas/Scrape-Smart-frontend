import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { getRoute, type RouteResult } from "../../services/geoapifyRoutingService";
import type { LiveLocation } from "../../types/liveTracking";

const GREEN = "#82AA68";
const NAVY = "#393666";
const ROUTE_REFRESH_MS = 60_000;
const ROUTE_REFRESH_DISTANCE_METERS = 200;

interface PickupPoint {
  lat?: number | null;
  lng?: number | null;
  label?: string;
}

interface LiveTrackingMapProps {
  location: LiveLocation | null;
  pickup?: PickupPoint;
}

function distanceMeters(a: [number, number], b: [number, number]) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6_371_000;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function markerIcon(label: string, color: string) {
  return L.divIcon({
    className: "tracking-marker",
    html: `<span style="background:${color}">${label}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function BoundsUpdater({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    if (points.length > 1) {
      map.fitBounds(points, { padding: [28, 28], maxZoom: 15 });
    }
  }, [map, points]);

  return null;
}

function formatDistance(meters: number) {
  if (!meters) return "Distance unavailable";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  if (!seconds) return "ETA unavailable";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

function formatUpdatedAt(value: unknown) {
  if (!value) return "";
  if (value instanceof Date) return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (typeof value === "object" && value && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return "";
}

export function LiveTrackingMap({ location, pickup }: LiveTrackingMapProps) {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeError, setRouteError] = useState("");
  const lastRouteAtRef = useRef(0);
  const lastRouteOriginRef = useRef<[number, number] | null>(null);

  const collectorPoint = location ? ([location.lat, location.lng] as [number, number]) : null;
  const pickupPoint =
    typeof pickup?.lat === "number" && typeof pickup.lng === "number"
      ? ([pickup.lat, pickup.lng] as [number, number])
      : null;

  const mapPoints = useMemo(() => {
    return [collectorPoint, pickupPoint].filter(Boolean) as [number, number][];
  }, [collectorPoint, pickupPoint]);

  useEffect(() => {
    if (!collectorPoint || !pickupPoint || !apiKey) {
      setRoute(null);
      return;
    }

    const now = Date.now();
    const lastOrigin = lastRouteOriginRef.current;
    const movedEnough = !lastOrigin || distanceMeters(lastOrigin, collectorPoint) >= ROUTE_REFRESH_DISTANCE_METERS;
    const waitedEnough = now - lastRouteAtRef.current >= ROUTE_REFRESH_MS;
    if (!movedEnough && !waitedEnough) return;

    lastRouteAtRef.current = now;
    lastRouteOriginRef.current = collectorPoint;
    setRouteError("");

    getRoute({
      fromLat: collectorPoint[0],
      fromLng: collectorPoint[1],
      toLat: pickupPoint[0],
      toLng: pickupPoint[1],
      mode: "drive",
    })
      .then(setRoute)
      .catch((err) => {
        setRoute(null);
        setRouteError(err instanceof Error ? err.message : "Route unavailable.");
      });
  }, [apiKey, collectorPoint, pickupPoint]);

  if (!apiKey) {
    return <div className="notice notice-warning">Geoapify is not configured. Set VITE_GEOAPIFY_API_KEY.</div>;
  }

  if (!location || !collectorPoint) {
    return <div className="notice notice-info">Waiting for collector location...</div>;
  }

  const updatedAt = formatUpdatedAt(location.updatedAt);

  return (
    <div className="live-tracking-shell">
      <div className="live-tracking-map">
        <MapContainer center={collectorPoint} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.geoapify.com/">Geoapify</a>'
            url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`}
          />
          <BoundsUpdater points={mapPoints} />
          <Marker position={collectorPoint} icon={markerIcon("C", GREEN)}>
            <Popup>Collector location</Popup>
          </Marker>
          {pickupPoint && (
            <Marker position={pickupPoint} icon={markerIcon("P", NAVY)}>
              <Popup>{pickup?.label ?? "Pickup location"}</Popup>
            </Marker>
          )}
          {route && <Polyline positions={route.coordinates} pathOptions={{ color: GREEN, weight: 5, opacity: 0.82 }} />}
        </MapContainer>
      </div>

      <div className="live-tracking-meta">
        {route ? (
          <>
            <span>{formatDistance(route.distanceMeters)}</span>
            <span>{formatDuration(route.durationSeconds)}</span>
          </>
        ) : pickupPoint ? (
          <span>{routeError || "Calculating route..."}</span>
        ) : (
          <span>Route unavailable because pickup coordinates are missing.</span>
        )}
        {updatedAt && <span>Updated {updatedAt}</span>}
      </div>
    </div>
  );
}
