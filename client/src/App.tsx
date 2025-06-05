import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TeamProvider } from "./contexts/TeamContext";
import { TaskProvider } from "./contexts/TaskContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthGuard } from "./components/AuthGuard";
import { InvitationProvider } from "./contexts/InvitationContext";

const SignIn = React.lazy(() => import("./pages/SignIn"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <TeamProvider>
              <InvitationProvider>
                <TaskProvider>
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                      </div>
                    }
                  >
                    <Routes>
                      <Route path="/auth/signin" element={<SignIn />} />
                      <Route path="/auth/signup" element={<SignUp />} />
                      <Route path="/auth/forgot" element={<ForgotPassword />} />

                      <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                      />

                      <Route
                        path="/login"
                        element={<Navigate to="/auth/signin" replace />}
                      />

                      {/* ————— Protected area ————— */}
                      <Route
                        path="/"
                        element={
                          <AuthGuard>
                            <Dashboard />
                          </AuthGuard>
                        }
                      />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </React.Suspense>
                </TaskProvider>
              </InvitationProvider>
            </TeamProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
