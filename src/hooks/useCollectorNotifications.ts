import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToCollectorNotifications } from "../services/notificationService";
import type { CollectorNotification } from "../types/notification";
import { getErrorMessage } from "../utils/errors";

export function useCollectorNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<CollectorNotification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile?.uid || profile.role !== "collector") {
      setNotifications([]);
      return undefined;
    }

    return subscribeToCollectorNotifications(
      profile.uid,
      setNotifications,
      (err) => setError(getErrorMessage(err))
    );
  }, [profile?.uid, profile?.role]);

  return { notifications, error };
}
