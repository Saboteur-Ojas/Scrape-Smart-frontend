import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { app } from "./client";

export const db = getFirestore(app);

const useFirebaseEmulator = false;

if (useFirebaseEmulator && !(globalThis as { __SCRAPSMART_FIRESTORE_EMULATOR_CONNECTED__?: boolean }).__SCRAPSMART_FIRESTORE_EMULATOR_CONNECTED__) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  (globalThis as { __SCRAPSMART_FIRESTORE_EMULATOR_CONNECTED__?: boolean }).__SCRAPSMART_FIRESTORE_EMULATOR_CONNECTED__ = true;
}
