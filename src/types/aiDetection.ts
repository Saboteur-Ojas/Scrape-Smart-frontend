import type { ScrapCategory } from "./pickupRequest";

export interface AIDetectionResult {
  detectionId?: string;
  detectedCategory: ScrapCategory;
  confidence: number;
  notes: string;
  suggestedDescription: string;
}
