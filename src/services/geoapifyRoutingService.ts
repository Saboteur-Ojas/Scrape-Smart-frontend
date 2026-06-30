export type RouteMode = "drive" | "walk" | "bicycle";

export interface RouteRequest {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  mode?: RouteMode;
}

export interface RouteResult {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
}

interface GeoapifyFeature {
  geometry?: {
    type: "LineString" | "MultiLineString";
    coordinates: number[][] | number[][][];
  };
  properties?: {
    distance?: number;
    time?: number;
  };
}

interface GeoapifyRoutingResponse {
  features?: GeoapifyFeature[];
}

interface GeoapifyGeocodeFeature {
  properties?: {
    lat?: number;
    lon?: number;
  };
}

interface GeoapifyGeocodeResponse {
  features?: GeoapifyGeocodeFeature[];
}

function getApiKey() {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
  if (!apiKey) throw new Error("Geoapify is not configured. Set VITE_GEOAPIFY_API_KEY.");
  return apiKey;
}

function flattenCoordinates(feature: GeoapifyFeature): number[][] {
  if (!feature.geometry) return [];
  if (feature.geometry.type === "LineString") {
    return feature.geometry.coordinates as number[][];
  }
  return (feature.geometry.coordinates as number[][][]).flat();
}

export async function getRoute({
  fromLat,
  fromLng,
  toLat,
  toLng,
  mode = "drive",
}: RouteRequest): Promise<RouteResult> {
  const apiKey = getApiKey();
  const url = new URL("https://api.geoapify.com/v1/routing");
  url.searchParams.set("waypoints", `${fromLat},${fromLng}|${toLat},${toLng}`);
  url.searchParams.set("mode", mode);
  url.searchParams.set("apiKey", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Geoapify routing failed (${response.status}).`);
  }

  const data = (await response.json()) as GeoapifyRoutingResponse;
  const feature = data.features?.[0];
  if (!feature) throw new Error("No route was returned.");

  const coordinates = flattenCoordinates(feature)
    .filter((point) => point.length >= 2)
    .map(([lng, lat]) => [lat, lng] as [number, number]);

  if (coordinates.length === 0) throw new Error("Route geometry was empty.");

  return {
    coordinates,
    distanceMeters: feature.properties?.distance ?? 0,
    durationSeconds: feature.properties?.time ?? 0,
  };
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const apiKey = getApiKey();
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", address);
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Geoapify geocoding failed (${response.status}).`);
  }

  const data = (await response.json()) as GeoapifyGeocodeResponse;
  const first = data.features?.[0]?.properties;
  if (typeof first?.lat !== "number" || typeof first.lon !== "number") return null;
  return { lat: first.lat, lng: first.lon };
}
