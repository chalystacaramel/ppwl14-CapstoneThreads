import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/auth.store";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DetailPostPage from "./pages/DetailPostPage";
import NotifPage from "./pages/NotifPage";
import FormPostPage from "./pages/FormPostPage";
import EditProfilePage from "./pages/EditProfilePage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><HomePage /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/post/:id",
    element: <ProtectedRoute><DetailPostPage /></ProtectedRoute>,
  },
  {
    path: "/notifications",
    element: <ProtectedRoute><NotifPage /></ProtectedRoute>,
  },
  {
    path: "/new-post",
    element: <ProtectedRoute><FormPostPage /></ProtectedRoute>,
  },
  {
    path: "/edit-profile",
    element: <ProtectedRoute><EditProfilePage /></ProtectedRoute>,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;