// apps/frontend/src/pages/EditProfilePage.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { BACKEND_URL } from "@/constants";

const getInitial = (name: string) => name.charAt(0).toUpperCase();

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, accessToken, setAuth } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");
  // FIX issue #5: bio pakai default dari user jika ada
  const [bio, setBio] = useState((user as any)?.bio ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // FIX issue #4 & #6: state untuk avatar baru
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FIX issue #6: avatar URL dari Google (lh3.googleusercontent.com) perlu referrerPolicy
  const currentAvatarUrl = avatarPreview ?? user?.avatarUrl;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // FIX issue #5: handleSave sekarang benar-benar memanggil API
  const handleSave = async () => {
    setError("");
    if (!name.trim()) return setError("Nama tidak boleh kosong.");
    if (password && password !== confirmPassword) return setError("Password tidak cocok.");
    if (password && password.length < 6) return setError("Password minimal 6 karakter.");
    if (!accessToken) return setError("Sesi habis, silakan login ulang.");

    setLoading(true);
    try {
      let avatarUrl = user?.avatarUrl;

      // Upload foto profil baru ke S3 jika ada
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await fetch(`${BACKEND_URL}/posts/upload-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.imageUrl;
        }
      }

      // Update profil ke backend
      const res = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          avatarUrl,
          ...(password ? { password } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menyimpan profil");
      }

      const data = await res.json();

      // Update auth store dengan data terbaru
      setAuth(
        {
          ...user!,
          name: data.user?.name ?? name,
          avatarUrl: data.user?.avatarUrl ?? avatarUrl,
          ...(data.user?.bio ? { bio: data.user.bio } : { bio }),
        } as any,
        accessToken
      );

      setPassword("");
      setConfirmPassword("");
      setAvatarFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
            className="text-sm font-semibold text-[#1877F2] hover:text-[#18A3FE] transition-colors disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Avatar - FIX issue #4: bisa diubah */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative cursor-pointer" onClick={handleAvatarClick}>
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt="avatar"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  // FIX issue #6: fallback ke initial jika gambar gagal load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-20 h-20 rounded-full bg-[#333638] flex items-center justify-center text-2xl font-bold text-[#F3F5F7] ${currentAvatarUrl ? 'hidden' : ''}`}
            >
              {getInitial(name || "U")}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center">
              <Camera size={14} />
            </div>
          </div>
          <span className="text-sm text-[#777]">Ketuk untuk ubah foto profil</span>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
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

          {/* Email (readonly) */}
          <div>
            <label className="text-xs text-[#777] mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-[#1E1E1E] border border-[#3E4042] rounded-xl px-4 py-3 text-[15px] text-[#555] placeholder:text-[#65676B] outline-none cursor-not-allowed"
              placeholder="Email"
            />
            <p className="text-xs text-[#555] mt-1">Email tidak dapat diubah</p>
          </div>

          {/* Bio - FIX issue #5: nilai default dari user.bio */}
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

          {/* Password */}
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

          {error && <p className="text-sm text-[#FF2E40]">{error}</p>}

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