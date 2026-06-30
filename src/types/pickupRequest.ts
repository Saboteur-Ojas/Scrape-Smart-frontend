import type { ScrapImage } from "./cloudinary";

export type ScrapCategory = "newspaper" | "cardboard" | "plastic" | "metal" | "e_waste" | "mixed" | "other";
export type PickupStatus = "open" | "accepted" | "completed" | "cancelled";

export interface PickupAddress {
  line: string;
  area: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
}

export interface PickupRequest {
  requestId: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: ScrapCategory;
  scrapCategory?: ScrapCategory;
  aiDetectedCategory?: string;
  aiConfidence?: number;
  aiNotes?: string;
  quantity: string;
  description: string;
  images: ScrapImage[];
  imageUrl?: string;
  imagePublicId?: string;
  imageUrls?: string[];
  address: PickupAddress;
  pickupAddress?: string;
  location?: { lat: number; lng: number } | null;
  city: string;
  cityNormalized: string;
  pickupLocation?: { lat: number; lng: number } | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  status: PickupStatus;
  collectorId: string | null;
  collectorName: string | null;
  collectorPhone?: string | null;
  expectedPrice: number | null;
  finalPrice: number | null;
  trackingEnabled?: boolean;
  trackingStartedAt?: any;
  trackingStoppedAt?: any;
  createdAt?: any;
  updatedAt?: any;
  acceptedAt?: any;
  completedAt?: any;
  cancelledAt?: any;
}

export interface CreatePickupRequestInput {
  userId: string;
  userName: string;
  userPhone: string;
  category: ScrapCategory;
  aiDetectedCategory?: string;
  aiConfidence?: number;
  aiNotes?: string;
  quantity: string;
  description: string;
  images: ScrapImage[];
  imageUrls?: string[];
  address: PickupAddress;
  city?: string;
  cityNormalized?: string;
  pickupLocation?: { lat: number; lng: number } | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  expectedPrice?: number | null;
  trackingEnabled?: boolean;
  trackingStartedAt?: any;
  trackingStoppedAt?: any;
}
