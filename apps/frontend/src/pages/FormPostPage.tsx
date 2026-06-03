// apps/frontend/src/pages/FormPostPage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { usePostStore } from "@/stores/usePostStore";
import { useAuthStore } from "@/stores/auth.store";

const MAX_CHARS = 500;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const tokens = {
  bgPrimary: "#101010",
  bgTertiary: "#1E1E1E",
  textPrimary: "#F3F5F7",
  textSecondary: "#777777",
  placeholder: "#8A8D91",
  divider: "#3E4042",
} as const;

export default function FormPostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const { accessToken } = useAuthStore();
  const { draft, setDraft, clearDraft, posts } = usePostStore();
  const { text, images } = draft;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const remaining = MAX_CHARS - text.length;
  const isOver = remaining < 0;
  const isEmpty = text.trim().length === 0 && images.length === 0;
  const isEditMode = !!editId;

  // FIX issue #7: load existing image saat edit mode
  useEffect(() => {
    if (!editId) return;
    const post = posts.find((p) => p.id === editId);
    if (post) setDraft(post.text, post.images);
  }, [editId, posts, setDraft]);

  // autosize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [text]);

  const handlePost = async () => {
    if (isEmpty || isOver || uploading) return;
    if (!accessToken) return alert("Login dulu");

    setUploading(true);
    setUploadStatus(null);

    try {
      let imageUrl: string | null = null;

      if (images[0]?.file) {
        // File baru dipilih — upload ke S3
        setUploadStatus("Mengupload gambar...");
        const formData = new FormData();
        formData.append("file", images[0].file);

        const uploadRes = await fetch(`${BACKEND_URL}/posts/upload-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error("Gagal upload gambar: " + (errData.message || uploadRes.status));
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      } else if (images[0]?.previewUrl && !images[0]?.file) {
        // FIX issue #7: gambar lama (sudah di S3) — pakai URL yang ada
        imageUrl = images[0].previewUrl;
      }

      setUploadStatus("Menyimpan postingan...");

      if (isEditMode && editId) {
        // Mode edit
        const res = await fetch(`${BACKEND_URL}/posts/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: text.trim(),
            ...(imageUrl !== undefined ? { imageUrl: imageUrl ?? null } : {}),
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(`${res.status}: ${errData.message || "Unknown error"}`);
        }
      } else {
        // Mode buat baru
        const res = await fetch(`${BACKEND_URL}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: text.trim(),
            ...(imageUrl ? { imageUrl } : {}),
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(`${res.status}: ${errData.message || "Unknown error"}`);
        }
      }

      clearDraft();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
      setUploadStatus(null);
    }
  };

  return (
    <div className="min-h-screen flex justify-center" style={{ background: tokens.bgPrimary }}>
      <div className="w-full max-w-[560px] p-4">
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: tokens.bgTertiary, borderColor: tokens.divider }}>

          {/* header */}
          <div className="flex justify-between items-center px-5 py-4">
            <button
              onClick={() => navigate(-1)}
              style={{ color: tokens.textSecondary, fontSize: 15 }}
            >
              Batal
            </button>
            <h1 style={{ color: tokens.textPrimary, fontSize: 16, fontWeight: 600 }}>
              {isEditMode ? "Edit threadster" : "Threadster baru"}
            </h1>
            <div style={{ width: 40 }} />
          </div>

          {/* body */}
          <div className="px-5">
            <textarea
              ref={textareaRef}
              value={text}
              placeholder="Ada apa?"
              onChange={(e) => setDraft(e.target.value, images)}
              className="w-full bg-transparent outline-none resize-none"
              style={{ color: tokens.textPrimary, fontSize: 15, lineHeight: 1.55, minHeight: 80 }}
            />

            {/* preview gambar */}
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img) => (
                  <div key={img.id} className="relative w-24 h-24">
                    <img
                      src={img.previewUrl}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setDraft(text, images.filter((i) => i.id !== img.id))}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* FIX issue #7: tampilkan ImageUpload di edit mode juga */}
            <ImageUpload images={images} onChange={(imgs) => setDraft(text, imgs)} />
          </div>

          {/* footer */}
          <div className="flex justify-between items-center px-5 py-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ color: isOver ? '#ff3040' : tokens.textSecondary, fontSize: 13 }}>
                {remaining}
              </span>
              {uploadStatus && (
                <span style={{ color: '#888', fontSize: 12 }}>{uploadStatus}</span>
              )}
            </div>

            <Button
              onClick={handlePost}
              disabled={isEmpty || isOver || uploading}
            >
              {uploading ? "Memposting..." : isEditMode ? "Simpan" : "Post"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}