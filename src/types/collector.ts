export interface CollectorProfile {
  uid: string;
  collectorId?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  cityNormalized?: string;
  serviceCity?: string;
  currentLocation?: { lat: number; lng: number; updatedAt?: unknown } | null;
  serviceAreas: string[];
  isAvailable: boolean;
  rating: number;
  totalPickups: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RegisterCollectorInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  city: string;
  serviceAreas: string[];
}

export interface UpdateCollectorProfileInput {
  phone: string;
  city: string;
  serviceAreas: string[];
  isAvailable: boolean;
}
