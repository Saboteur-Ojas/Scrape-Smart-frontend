export interface LiveLocation {
  requestId: string;
  collectorId: string;
  userId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  updatedAt?: unknown;
  active: boolean;
}

export interface LiveLocationInput {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
}
