import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";

interface ProtectedRouteProps {
  /**
   * Jika true (default): halaman HANYA bisa diakses user yang sudah login.
   * Jika false: halaman HANYA bisa diakses user yang BELUM login
   *   (misal: halaman login/register — redirect ke beranda kalau sudah login).
   */
  requireAuth?: boolean;
  /** Path redirect jika syarat tidak terpenuhi. Default: "/login" atau "/" */
  redirectTo?: string;
}

/**
 * ProtectedRoute — wrapper komponen untuk React Router v6.
 *
 * Contoh penggunaan di router:
 *
 * // Halaman yang butuh login:
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/buat-post" element={<FormPost />} />
 *   <Route path="/notifikasi" element={<NotifPage />} />
 *   <Route path="/edit-profil" element={<EditProfile />} />
 * </Route>
 *
 * // Halaman yang tidak boleh diakses kalau sudah login:
 * <Route element={<ProtectedRoute requireAuth={false} redirectTo="/" />}>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/register" element={<RegisterPage />} />
 * </Route>
 */
export default function ProtectedRoute({
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const location = useLocation();

  // Saat pertama load, tunggu dulu cek localStorage selesai
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101010] flex items-center justify-center">
        <span className="text-[#777777] text-[14px]">Memuat...</span>
      </div>
    );
  }

  // User belum login tapi halaman butuh login → redirect ke login
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo ?? "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  // User sudah login tapi ini halaman login/register → redirect ke beranda
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo ?? "/"} replace />;
  }

  // Semua oke, render halaman
  return <Outlet />;
}