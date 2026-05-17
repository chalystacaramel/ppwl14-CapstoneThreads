import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";

const CURRENT_USER = {
  name: "Iqlima Nur`ain",
  email: "iqlima@example.com",
  bio: "",
  avatar: "",
};

const getInitial = (name: string) => name.charAt(0).toUpperCase();

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [name, setName] = useState(CURRENT_USER.name);
  const [email, setEmail] = useState(CURRENT_USER.email);
  const [bio, setBio] = useState(CURRENT_USER.bio);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    if (!name.trim()) return setError("Nama tidak boleh kosong.");
    if (password && password !== confirmPassword) return setError("Password tidak cocok.");
    if (password && password.length < 6) return setError("Password minimal 6 karakter.");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#101010] text-[#F3F5F7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#101010]/90 backdrop-blur border-b border-[#3E4042] px-4 py-3">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[#1E1E1E] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-base font-semibold">Edit Profil</h1>
          <button
            onClick={handleSave}
            className="text-sm font-semibold text-[#1877F2] hover:text-[#18A3FE] transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#333638] flex items-center justify-center text-2xl font-bold text-[#F3F5F7]">
              {getInitial(name || "U")}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center">
              <Camera size={14} />
            </button>
          </div>
          <span className="text-sm text-[#777]">Ubah foto profil</span>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Nama */}
          <div>
            <label className="text-xs text-[#777] mb-1 block">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#3E4042] rounded-xl px-4 py-3 text-[15px] text-[#F3F5F7] placeholder:text-[#65676B] outline-none focus:border-[#65676B] transition-colors"
              placeholder="Nama lengkap"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-[#777] mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#3E4042] rounded-xl px-4 py-3 text-[15px] text-[#F3F5F7] placeholder:text-[#65676B] outline-none focus:border-[#65676B] transition-colors"
              placeholder="Email"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs text-[#777] mb-1 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={150}
              className="w-full bg-[#1E1E1E] border border-[#3E4042] rounded-xl px-4 py-3 text-[15px] text-[#F3F5F7] placeholder:text-[#65676B] outline-none focus:border-[#65676B] transition-colors resize-none"
              placeholder="Tulis bio..."
            />
            <p className="text-xs text-[#777] text-right mt-1">{bio.length}/150</p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#3E4042] pt-4">
            <p className="text-sm text-[#777] mb-3">Ganti Password (opsional)</p>

            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#3E4042] rounded-xl px-4 py-3 text-[15px] text-[#F3F5F7] placeholder:text-[#65676B] outline-none focus:border-[#65676B] transition-colors"
                placeholder="Password baru"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#3E4042] rounded-xl px-4 py-3 text-[15px] text-[#F3F5F7] placeholder:text-[#65676B] outline-none focus:border-[#65676B] transition-colors"
                placeholder="Konfirmasi password baru"
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-[#FF2E40]">{error}</p>}

          {/* Success */}
          {saved && (
            <div className="bg-[#1E1E1E] border border-[#31A24C] rounded-xl px-4 py-3 text-sm text-[#31A24C] text-center">
              Profil berhasil disimpan!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}