export interface Review {
  reviewId: string;
  requestId: string;
  userId: string;
  collectorId: string;
  rating: number;
  comment: string;
  createdAt?: unknown;
}

export interface CreateReviewInput {
  requestId: string;
  collectorId: string;
  rating: number;
  comment: string;
}
