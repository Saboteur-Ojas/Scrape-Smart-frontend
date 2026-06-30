import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { RoleRoute } from "../components/auth/RoleRoute";

// Public pages
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

// User pages
import { UserDashboard } from "../pages/user/UserDashboard";
import { CreateRequestPage } from "../pages/user/CreateRequestPage";
import { UserRequestsPage } from "../pages/user/UserRequestsPage";
import { UserRequestDetailPage } from "../pages/user/UserRequestDetailPage";
import { UserProfilePage } from "../pages/user/UserProfilePage";

// Collector pages
import { CollectorDashboard } from "../pages/collector/CollectorDashboard";
import { CollectorOpenRequestsPage } from "../pages/collector/CollectorOpenRequestsPage";
import { CollectorRequestsPage } from "../pages/collector/CollectorRequestsPage";
import { CollectorRequestDetailPage } from "../pages/collector/CollectorRequestDetailPage";
import { CollectorProfilePage } from "../pages/collector/CollectorProfilePage";

/**
 * Root redirect — once auth is resolved, send users to their correct dashboard.
 * If unauthenticated, land on the landing page.
 */
function RootRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading ScrapSmart..." fullPage />;
  }

  if (!user || !profile) {
    return <LandingPage />;
  }

  return (
    <Navigate
      to={profile.role === "collector" ? "/collector/dashboard" : "/user/dashboard"}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Root ─────────────────────────────────────────────── */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Public ───────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── User ─────────────────────────────────────────────── */}
      <Route
        path="/user/dashboard"
        element={
          <RoleRoute role="user">
            <UserDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/user/create-request"
        element={
          <RoleRoute role="user">
            <CreateRequestPage />
          </RoleRoute>
        }
      />
      <Route
        path="/user/requests"
        element={
          <RoleRoute role="user">
            <UserRequestsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/user/requests/:id"
        element={
          <RoleRoute role="user">
            <UserRequestDetailPage />
          </RoleRoute>
        }
      />
      <Route
        path="/user/profile"
        element={
          <RoleRoute role="user">
            <UserProfilePage />
          </RoleRoute>
        }
      />

      {/* ── Collector ─────────────────────────────────────────── */}
      <Route
        path="/collector/dashboard"
        element={
          <RoleRoute role="collector">
            <CollectorDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/collector/open-requests"
        element={
          <RoleRoute role="collector">
            <CollectorOpenRequestsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/collector/requests"
        element={
          <RoleRoute role="collector">
            <CollectorRequestsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/collector/requests/:id"
        element={
          <RoleRoute role="collector">
            <CollectorRequestDetailPage />
          </RoleRoute>
        }
      />
      <Route
        path="/collector/profile"
        element={
          <RoleRoute role="collector">
            <CollectorProfilePage />
          </RoleRoute>
        }
      />

      {/* ── Catch-all: redirect to root ──────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
