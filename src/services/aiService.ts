import type { AIDetectionResult } from "../types/aiDetection";
import { apiFetch } from "./apiClient";

export async function detectScrapFromImage(imageUrl: string) {
  return apiFetch<AIDetectionResult & { detectionId: string }>("/api/ai/detect", {
    method: "POST",
    body: JSON.stringify({ imageUrl }),
  });
}
