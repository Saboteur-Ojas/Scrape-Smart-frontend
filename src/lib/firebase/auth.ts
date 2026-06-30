import { getAuth, connectAuthEmulator } from "firebase/auth";
import { app } from "./client";

export const auth = getAuth(app);

const useFirebaseEmulator = false;

if (useFirebaseEmulator && !(globalThis as { __SCRAPSMART_AUTH_EMULATOR_CONNECTED__?: boolean }).__SCRAPSMART_AUTH_EMULATOR_CONNECTED__) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  (globalThis as { __SCRAPSMART_AUTH_EMULATOR_CONNECTED__?: boolean }).__SCRAPSMART_AUTH_EMULATOR_CONNECTED__ = true;
}
