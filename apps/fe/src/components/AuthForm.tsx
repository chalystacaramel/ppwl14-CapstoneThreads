import { useState } from "react";

export interface AuthFormData {
  username?: string;
  email: string;
  password: string;
}

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: AuthFormData) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function AuthForm({ mode, onSubmit, isLoading = false, error = null }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, username });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[9px] w-full">
      {!isLogin && (
        <input
          type="text"
          placeholder="Nama pengguna"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full bg-[#1e1e1e] border border-[#2d2d2d] text-[#f3f5f7] px-[18px] py-[21px] rounded-[15px] text-[14.5px] placeholder:text-[#555555] focus:outline-none focus:border-[#3d3d3d] font-medium tracking-tight"
        />
      )}

      <input
        type="email"
        placeholder="Nama pengguna, telepon, atau email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        className="w-full bg-[#1e1e1e] border border-[#2d2d2d] text-[#f3f5f7] px-[18px] py-[21px] rounded-[15px] text-[14.5px] placeholder:text-[#555555] focus:outline-none focus:border-[#3d3d3d] font-medium tracking-tight"
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="w-full bg-[#1e1e1e] border border-[#2d2d2d] text-[#f3f5f7] px-[18px] py-[21px] pr-[110px] rounded-[15px] text-[14.5px] placeholder:text-[#555555] focus:outline-none focus:border-[#3d3d3d] font-medium tracking-tight"
        />
      </div>

      {error && (
        <p className="text-[13px] text-[#FF2E40] font-medium px-1">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#f3f5f7] text-black font-bold py-[17px] rounded-[15px] mt-2 text-[15px] hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isLoading ? (isLogin ? "Masuk..." : "Mendaftar...") : (isLogin ? "Login" : "Daftar")}
      </button>
    </form>
  );
}