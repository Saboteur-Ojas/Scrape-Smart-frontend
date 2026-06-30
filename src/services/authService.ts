import type { User } from "firebase/auth";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { auth } from "../lib/firebase/auth";
import { db } from "../lib/firebase/firestore";
import type { CollectorProfile, RegisterCollectorInput } from "../types/collector";
import type { RegisterUserInput, UpdateUserLocationInput, UserProfile } from "../types/user";
import { validateEmail, validatePassword, cleanCity, normalizeCity } from "../utils/validation";

export async function registerUser(input: RegisterUserInput) {
  const email = validateEmail(input.email);
  validatePassword(input.password);
  const credential = await createUserWithEmailAndPassword(auth, email, input.password);
  await updateProfile(credential.user, { displayName: input.name });
  const profile = {
    uid: credential.user.uid,
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    role: "user" as const,
    city: cleanCity(input.city),
    cityNormalized: normalizeCity(input.city),
    area: input.area.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await writeBatch(db).set(doc(db, "users", credential.user.uid), profile).commit();
  return { uid: credential.user.uid, profile: profile as UserProfile };
}

export async function registerCollector(input: RegisterCollectorInput) {
  const email = validateEmail(input.email);
  validatePassword(input.password);
  const credential = await createUserWithEmailAndPassword(auth, email, input.password);
  await updateProfile(credential.user, { displayName: input.name });
  const base = {
    uid: credential.user.uid,
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    city: cleanCity(input.city),
    cityNormalized: normalizeCity(input.city),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const userProfile = { ...base, role: "collector" as const };
  const collectorProfile = {
    ...base,
    collectorId: credential.user.uid,
    serviceCity: cleanCity(input.city),
    serviceAreas: input.serviceAreas,
    isAvailable: true,
    rating: 0,
    totalPickups: 0,
  };
  const batch = writeBatch(db);
  batch.set(doc(db, "users", credential.user.uid), userProfile);
  batch.set(doc(db, "collectors", credential.user.uid), collectorProfile);
  await batch.commit();
  return { uid: credential.user.uid, userProfile: userProfile as UserProfile, collectorProfile: collectorProfile as CollectorProfile };
}

export async function loginUser(email: string, password: string): Promise<{ user: User; profile: UserProfile }> {
  const credential = await signInWithEmailAndPassword(auth, validateEmail(email), password);
  const profile = await ensureUserProfile(credential.user);
  return { user: credential.user, profile };
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getCurrentUserProfile() {
  return auth.currentUser ? ensureUserProfile(auth.currentUser) : null;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}

async function ensureUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);
  if (userSnapshot.exists()) return userSnapshot.data() as UserProfile;

  const collectorSnapshot = await getDoc(doc(db, "collectors", user.uid));
  const fallbackName = user.displayName || user.email?.split("@")[0] || "ScrapSmart User";
  const fallbackEmail = user.email || "";

  const restoredProfile = collectorSnapshot.exists()
    ? ({
        uid: user.uid,
        name: collectorSnapshot.data().name || fallbackName,
        email: collectorSnapshot.data().email || fallbackEmail,
        phone: collectorSnapshot.data().phone || "",
        role: "collector",
        city: collectorSnapshot.data().city || collectorSnapshot.data().serviceCity || "",
        cityNormalized: collectorSnapshot.data().cityNormalized || normalizeCity(collectorSnapshot.data().city || collectorSnapshot.data().serviceCity || ""),
        createdAt: collectorSnapshot.data().createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as UserProfile)
    : ({
        uid: user.uid,
        name: fallbackName,
        email: fallbackEmail,
        phone: "",
        role: "user",
        city: "",
        cityNormalized: "",
        area: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } as UserProfile);

  await setDoc(userRef, restoredProfile, { merge: true });
  console.info("[ScrapSmart] Restored missing user profile", {
    uid: user.uid,
    role: restoredProfile.role,
  });
  return restoredProfile;
}

export async function updateUserLocation(input: UpdateUserLocationInput) {
  if (!auth.currentUser) throw new Error("Login required.");
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    city: cleanCity(input.city),
    cityNormalized: normalizeCity(input.city),
    area: input.area.trim(),
    updatedAt: serverTimestamp(),
  });
}
