import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login2";
import Dashboard from "./pages/Dashboard2";
import ExpenseManager from "./pages/ExpenseManager";
import ProtectedRoute from "./components/ProtectedRoute";
import Savings from './pages/Savings';
import SignupStepper from './components/SignupStepper'; // 👈 import the stepper

// 👇 Wrapper that handles redirect logic
const OnboardingGate = ({ children }) => {
  const onboardingComplete = localStorage.getItem('onboardingComplete');

  if (!onboardingComplete) {
    return <Navigate to="/signup" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Onboarding Route */}
      <Route path="/signup" element={<SignupStepper />} />

      {/* Protected + Onboarding-Gated Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <Dashboard />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <ExpenseManager />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />
      <Route
        path="/savings"
        element={
          <ProtectedRoute>
            <OnboardingGate>
              <Savings />
            </OnboardingGate>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
