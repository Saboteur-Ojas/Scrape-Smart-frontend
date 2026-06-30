import { collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { auth } from "../lib/firebase/auth";
import { db } from "../lib/firebase/firestore";
import type { PickupRequest } from "../types/pickupRequest";
import type { CreateReviewInput, Review } from "../types/review";

export async function createReview(input: CreateReviewInput) {
  if (!auth.currentUser) throw new Error("Login required.");
  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, "requests", input.requestId);
    const requestSnap = await transaction.get(requestRef);
    if (!requestSnap.exists()) throw new Error("Request not found.");
    const pickup = requestSnap.data() as PickupRequest;
    if (pickup.userId !== auth.currentUser!.uid || pickup.status !== "completed" || pickup.collectorId !== input.collectorId) {
      throw new Error("You can review only your completed pickup.");
    }
    const reviewRef = doc(db, "reviews", input.requestId);
    const existing = await transaction.get(reviewRef);
    if (existing.exists()) throw new Error("Review already submitted.");
    transaction.set(reviewRef, {
      reviewId: input.requestId,
      requestId: input.requestId,
      userId: auth.currentUser!.uid,
      collectorId: input.collectorId,
      rating: input.rating,
      comment: input.comment,
      createdAt: serverTimestamp(),
    });
  });
  return input.requestId;
}

export async function getCollectorReviews(collectorId: string) {
  const snapshot = await getDocs(query(collection(db, "reviews"), where("collectorId", "==", collectorId)));
  return snapshot.docs
    .map((item) => item.data() as Review)
    .sort((a, b) => {
      const getMillis = (value: unknown) => {
        if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
          return value.toDate().getTime();
        }
        return value ? new Date(value as string | number).getTime() : 0;
      };
      return getMillis(b.createdAt) - getMillis(a.createdAt);
    });
}

export async function getReviewByRequest(requestId: string) {
  const snapshot = await getDoc(doc(db, "reviews", requestId));
  return snapshot.exists() ? (snapshot.data() as Review) : null;
}
