import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthForm, AuthFormData } from "@/components/AuthForm";
import { ThreadsBackground } from "@/components/ui/ThreadsBackground";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "";

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ig-grad2" x1="2" y1="22" x2="22" y2="2">
        <stop offset="0%" stopColor="#feda75" />
        <stop offset="25%" stopColor="#fa7e1e" />
        <stop offset="50%" stopColor="#d62976" />
        <stop offset="75%" stopColor="#962fbf" />
        <stop offset="100%" stopColor="#4f5bd5" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#ig-grad2)" />
    <rect x="5.5" y="5.5" width="13" height="13" rx="3.8" stroke="white" strokeWidth="1.3" fill="none" />
    <circle cx="12" cy="12" r="3.1" stroke="white" strokeWidth="1.3" fill="none" />
    <circle cx="17.3" cy="6.7" r="0.8" fill="white" />
  </svg>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.message ?? "Registrasi gagal. Coba lagi.");
      }
      navigate("/login", { state: { registered: true } });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] text-[#f3f5f7] flex flex-col items-center justify-between relative overflow-hidden py-8 px-6 font-sans antialiased">
      <ThreadsBackground />

      <div className="flex-grow flex flex-col items-center justify-center w-full z-10">
        <div className="flex flex-col items-center w-full max-w-[370px]">

          <h2 className="text-[15.5px] font-bold mb-7 tracking-tight">
            Buat akun baru
          </h2>

          <AuthForm mode="register" onSubmit={handleRegister} isLoading={isLoading} error={error} />

          <div className="flex items-center w-full my-6">
            <div className="flex-1 h-[0.5px] bg-[#262626]" />
            <div className="px-4 text-[#777777] text-[12.5px] font-bold">atau</div>
            <div className="flex-1 h-[0.5px] bg-[#262626]" />
          </div>

          <button
            onClick={() => window.location.href = `${API_BASE}/api/auth/google`}
            className="w-full flex items-center justify-between p-[17px] border border-[#2d2d2d] rounded-[18px] bg-transparent hover:bg-[#151515] transition-all"
          >
            <div className="flex items-center gap-4">
              <InstagramIcon />
              <span className="font-bold text-[14.5px] tracking-tight">Lanjutkan dengan Instagram</span>
            </div>
            <span className="text-[#4d4d4d] text-xl font-extralight pr-1">›</span>
          </button>

          <div className="mt-8 text-[13px] text-[#777777]">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-[#f3f5f7] font-bold hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </div>

      <div className="z-10 flex flex-wrap justify-center gap-x-5 text-[11.5px] text-[#777777] font-medium opacity-50 pb-2">
        <span>© 2026</span>
        <span className="hover:underline cursor-pointer">Ketentuan Threads</span>
        <span className="hover:underline cursor-pointer">Kebijakan Privasi</span>
        <span className="hover:underline cursor-pointer">Kebijakan Cookie</span>
      </div>
    </div>
  );
}