import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth } from "../lib/firebase/auth";
import { db } from "../lib/firebase/firestore";
import type { CreatePickupRequestInput } from "../types/pickupRequest";
import type { CollectorMatchProfile, CollectorNotification } from "../types/notification";
import { cleanCity } from "../utils/validation";

export async function notifyMatchingCollectors(requestId: string, request: CreatePickupRequestInput) {
  if (!auth.currentUser || auth.currentUser.uid !== request.userId) {
    throw new Error("You can notify collectors only for your own request.");
  }

  const cleanedCity = cleanCity(request.address.city);

  const collectorsSnapshot = await getDocs(
    query(collection(db, "collectors"), where("serviceCity", "==", cleanedCity))
  );

  const matchingCollectors = collectorsSnapshot.docs
    .map((item) => item.data() as CollectorMatchProfile)
    .filter((collector) => collector.isAvailable !== false)
    .slice(0, 50);

  if (matchingCollectors.length === 0) return 0;

  const batch = writeBatch(db);
  for (const collector of matchingCollectors) {
    const notificationId = `${requestId}_${collector.uid}`;
    batch.set(doc(db, "notifications", notificationId), {
      notificationId,
      recipientId: collector.uid,
      requestId,
      userId: request.userId,
      title: "New pickup request",
      message: `${request.category.replace("_", "-")} scrap in ${request.address.area}, ${cleanedCity}`,
      city: cleanedCity,
      area: request.address.area.trim(),
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return matchingCollectors.length;
}

export function subscribeToCollectorNotifications(
  collectorId: string,
  callback: (notifications: CollectorNotification[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    query(
      collection(db, "notifications"),
      where("recipientId", "==", collectorId)
    ),
    (snapshot) => {
      const getMillis = (value: unknown) => {
        if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
          return value.toDate().getTime();
        }
        return value ? new Date(value as string | number).getTime() : 0;
      };
      callback(
        snapshot.docs
          .map((item) => item.data() as CollectorNotification)
          .filter((notification) => notification.read === false)
          .sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt))
          .slice(0, 5)
      );
    },
    onError
  );
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
    updatedAt: serverTimestamp(),
  });
}
