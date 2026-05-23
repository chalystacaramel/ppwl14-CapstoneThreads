import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DetailPostPage from "./pages/DetailPostPage";
import NotifPage from "./pages/NotifPage";
import FormPostPage from "./pages/FormPostPage";
import EditProfilePage from "./pages/EditProfilePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
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
    element: <DetailPostPage />,
  },
  {
    path: "/notifications",
    element: <NotifPage />,
  },
  {
    path: "/new-post",
    element: <FormPostPage />,
  },
  {
    path: "/edit-profile",
    element: <EditProfilePage />,
  },
]);

export default router;