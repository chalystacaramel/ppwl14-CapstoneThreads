import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { usePostStore } from "@/stores/usePostStore";
import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";
import { elysiaErr } from "@/lib/elysiaErr";

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
  const token = useAuthStore((s) => s.token);
  const [searchParams] = useSearchParams();
  const editId = Number(searchParams.get("edit"));

  // console.log("ACCESS TOKEN:", token);
  const form = usePostStore((s) => s.form);
  const setForm = usePostStore((s) => s.setForm);
  const resetForm = usePostStore((s) => s.resetForm);
  const posts = usePostStore((s) => s.posts);
  const [content, setContent] = useState(form ? form.content : "");
  const [image, setImage] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const remaining = MAX_CHARS - content.length;
  const isOver = remaining < 0; // jika text kelewat batas, jangan kasih akses submit
  const isEmpty = content.trim().length === 0;

  // load Jika Mode Edit
  useEffect(() => {
    if (!editId) return;
    const post = posts.find((p) => p.id === editId);
    if (post) setForm({ content: post.content, image_url: post.image_url });
  }, [editId, posts, setForm]);

  // autosize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [content]);

  const handlePost = async () => {
    if (isEmpty || isOver || loading) return;
    if (!token) return alert("Login dulu");
    setLoading(true);

    console.log("TOKEN dari store:", token); // cukup log ini

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image); // Field nama 'image' dicocokkan dengan backend Elysia
      }
      console.log("PAYLOAD TEXT:", formData.get('content'));
      console.log("PAYLOAD IMAGE:", formData.get('image'));

      const resCreatePost = await axios.post(`${BACKEND_URL}/posts`,
        formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      });
      console.log("resCreatePost", resCreatePost);

      resetForm();
      navigate("/", { replace: true });

    } catch (err) {
      elysiaErr(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (form) {
      setForm((prev) => {
        const { image_url, ...rest } = prev;
        return rest;
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen flex justify-center" style={{ background: tokens.bgPrimary }}>
      <div className="w-full max-w-140 p-4">
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
              {editId ? "Edit thread" : "Thread baru"}
            </h1>
            {/* Kosong untuk spacing — hapus FileText & MoreHorizontal yang tidak dipakai */}
            <div style={{ width: 40 }} />
          </div>

          {/* body */}
          <div className="px-5">
            <textarea
              ref={textareaRef}
              value={content}
              placeholder="Ada apa?"
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent outline-none resize-none"
              style={{ color: tokens.textPrimary, fontSize: 15, lineHeight: 1.55, minHeight: 80 }}
            />

            {/* preview gambar */}
            {(image || form?.image_url) && (
              <div className="flex gap-2 mt-2 flex-wrap">
                <div className="relative w-24 h-24">
                  <img
                    src={
                      image
                        ? URL.createObjectURL(image)
                        : form?.image_url
                    }
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            )}

            {!editId && (
              <ImageUpload image={image} setImage={setImage} />
            )}
          </div>

          {/* footer */}
          <div className="flex justify-between items-center px-5 py-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ color: isOver ? '#ff3040' : tokens.textSecondary, fontSize: 13 }}>
                {remaining}
              </span>
            </div>

            <Button
              onClick={handlePost}
              disabled={isEmpty || isOver || loading}
            >
              {loading ? "Memposting..." : editId ? "Simpan" : "Post"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}