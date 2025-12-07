import { useAuth } from "../contexts/AuthContexts";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const alreadyRedirected = useRef(false);

  // 🧠 Check if onboarding is incomplete and we’re not already on signup flow
  const shouldRedirectToOnboarding = () => {
    if (alreadyRedirected.current) return false;

    const onboardingComplete = localStorage.getItem("onboardingComplete") === "true";
    const onSignupPage = location.pathname.startsWith("/signup");

    return !onboardingComplete && !onSignupPage;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (shouldRedirectToOnboarding()) {
    alreadyRedirected.current = true;
    return <Navigate to="/signup" replace />;
  }

  return children;
}
