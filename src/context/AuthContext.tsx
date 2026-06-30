import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase/auth";
import type { UserProfile } from "../types/user";
import { getCurrentUserProfile, loginUser, logoutUser } from "../services/authService";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserProfile["role"] | null;
  login: typeof loginUser;
  logout: typeof logoutUser;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile() {
    try {
      const nextProfile = await getCurrentUserProfile();
      setProfile(nextProfile);
      console.info("[ScrapSmart] Profile refresh", {
        success: Boolean(nextProfile),
        role: nextProfile?.role ?? null,
      });
    } catch (error) {
      console.error("[ScrapSmart] Profile refresh failed", error);
      setProfile(null);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (nextUser) => {
        console.info("[ScrapSmart] Auth state changed", {
          signedIn: Boolean(nextUser),
          uid: nextUser?.uid ?? null,
        });

        try {
          setUser(nextUser);

          if (!nextUser) {
            setProfile(null);
            return;
          }

          const nextProfile = await getCurrentUserProfile();
          if (!nextProfile) {
            console.warn("[ScrapSmart] Profile document missing", {
              uid: nextUser.uid,
            });
          } else {
            console.info("[ScrapSmart] Profile fetch success", {
              uid: nextUser.uid,
              role: nextProfile.role,
            });
          }
          setProfile(nextProfile);
        } catch (error) {
          console.error("[ScrapSmart] Auth initialization failed", error);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("[ScrapSmart] Auth state listener error", error);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, role: profile?.role ?? null, login: loginUser, logout: logoutUser, refreshProfile }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
