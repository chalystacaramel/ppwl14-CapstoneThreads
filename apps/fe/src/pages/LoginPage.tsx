import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthForm, AuthFormData } from "@/components/AuthForm";
import { useAuthContext } from "@/context/AuthContext";
import { ThreadsBackground } from "@/components/ui/ThreadsBackground";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "";

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2">
        <stop offset="0%" stopColor="#feda75" />
        <stop offset="25%" stopColor="#fa7e1e" />
        <stop offset="50%" stopColor="#d62976" />
        <stop offset="75%" stopColor="#962fbf" />
        <stop offset="100%" stopColor="#4f5bd5" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
    <rect x="5.5" y="5.5" width="13" height="13" rx="3.8" stroke="white" strokeWidth="1.3" fill="none" />
    <circle cx="12" cy="12" r="3.1" stroke="white" strokeWidth="1.3" fill="none" />
    <circle cx="17.3" cy="6.7" r="0.8" fill="white" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const justRegistered = location.state?.registered === true;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userRaw = params.get("user");
    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        login(token, user);
        navigate("/", { replace: true });
      } catch {
        setError("Login gagal. Coba lagi.");
      }
    }
  }, [login, navigate]);

  const handleLogin = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.message ?? "Nama pengguna atau kata sandi salah.");
      }
      const body = await res.json();
      login(body.token, body.user);
      const from = (location.state as any)?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstagram = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#101010] text-[#f3f5f7] flex flex-col items-center justify-between relative overflow-hidden py-8 px-6 font-sans antialiased">
      <ThreadsBackground />

      {/* QR Code pojok kanan bawah */}
      <div className="fixed bottom-9 right-9 hidden xl:flex flex-col items-end gap-3 z-20">
        <span className="text-[#777777] text-[11.5px] font-bold opacity-80 pr-2">
          Pindai untuk mendapatkan aplikasi
        </span>
        <div className="bg-[#181818] p-[22px] rounded-[42px] border border-[#262626] shadow-2xl">
          <div className="bg-white p-2 rounded-[14px]">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://threads.net"
              alt="QR Code"
              className="w-[92px] h-[92px]"
            />
          </div>
        </div>
      </div>

      {/* Konten utama */}
      <div className="flex-grow flex flex-col items-center justify-center w-full z-10">
        <div className="flex flex-col items-center w-full max-w-[370px]">

          {justRegistered && (
            <div className="w-full mb-4 px-4 py-3 rounded-xl border border-[#31A24C]/40 bg-[#0F6E56]/20">
              <p className="text-[13px] text-[#31A24C] font-medium text-center">
                Akun berhasil dibuat! Silakan masuk.
              </p>
            </div>
          )}

          <h2 className="text-[15.5px] font-bold mb-7 tracking-tight">
            Login dengan akun Instagram Anda
          </h2>

          <AuthForm mode="login" onSubmit={handleLogin} isLoading={isLoading} error={error} />

          <div className="mt-6 text-[#777777] text-[13.5px] font-medium cursor-pointer hover:text-[#999999] transition-colors">
            Lupa kata sandi?
          </div>

          <div className="flex items-center w-full my-6">
            <div className="flex-1 h-[0.5px] bg-[#262626]" />
            <div className="px-4 text-[#777777] text-[12.5px] font-bold">atau</div>
            <div className="flex-1 h-[0.5px] bg-[#262626]" />
          </div>

          {/* Tombol Instagram — seperti asli */}
          <button
            onClick={handleInstagram}
            className="w-full flex items-center justify-between p-[17px] border border-[#2d2d2d] rounded-[18px] bg-transparent hover:bg-[#151515] transition-all"
          >
            <div className="flex items-center gap-4">
              <InstagramIcon />
              <span className="font-bold text-[14.5px] tracking-tight">Lanjutkan dengan Instagram</span>
            </div>
            <span className="text-[#4d4d4d] text-xl font-extralight pr-1">›</span>
          </button>

          <div className="mt-8 text-[13px] text-[#777777]">
            Belum punya akun?{" "}
            <Link to="/register" className="text-[#f3f5f7] font-bold hover:underline">
              Daftar
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="z-10 flex flex-wrap justify-center gap-x-5 text-[11.5px] text-[#777777] font-medium opacity-50 pb-2">
        <span>© 2026</span>
        <span className="hover:underline cursor-pointer">Ketentuan Threads</span>
        <span className="hover:underline cursor-pointer">Kebijakan Privasi</span>
        <span className="hover:underline cursor-pointer">Kebijakan Cookie</span>
        <span className="hover:underline cursor-pointer">Laporkan masalah</span>
      </div>
    </div>
  );
}