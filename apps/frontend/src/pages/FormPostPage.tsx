import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { usePostStore } from "@/stores/usePostStore";
import { useAuthStore } from "@/stores/auth.store";

const MAX_CHARS = 500;

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

  const { accessToken, user } = useAuthStore();
  const username = user?.name?.toLowerCase().replace(/\s+/g, "_") ?? "me";
  const { draft, setDraft, clearDraft, updatePost, posts } =
    usePostStore();

  const { text, images } = draft;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [uploading, setUploading] = useState(false);

  const remaining = MAX_CHARS - text.length;
  const isOver = remaining < 0;
  const isEmpty = text.trim().length === 0 && images.length === 0;
  const isEditMode = !!editId;

  // load edit
  useEffect(() => {
    if (!editId) return;
    const post = posts.find((p) => p.id === editId);
    if (post) setDraft(post.text, post.images);
  }, [editId]);

  // autosize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      textareaRef.current.scrollHeight + "px";
  }, [text]);

  const handlePost = async () => {
    if (isEmpty || isOver || uploading) return;
    if (!accessToken) return alert("Login dulu");

    console.log("TOKEN:", accessToken);
    console.log("USER:", user);

    setUploading(true);

    try {
      const imageUrl = images[0]?.previewUrl || null;

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            content: text.trim(),
            ...(imageUrl ? { imageUrl } : {}),
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(`${res.status}: ${errData.message || 'Unknown error'}`)
      }

      clearDraft();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error: " + ((err as any)?.message || String(err)));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center" style={{ background: tokens.bgPrimary }}>
      <div className="w-full max-w-[560px] p-4">

        <div className="rounded-2xl border overflow-hidden"
          style={{ background: tokens.bgTertiary, borderColor: tokens.divider }}>

          {/* header */}
          <div className="flex justify-between px-5 py-4">
            <button onClick={() => navigate(-1)}>Cancel</button>
            <h1>{isEditMode ? "Edit thread" : "New thread"}</h1>
            <div className="flex gap-2">
              <FileText size={18} />
              <MoreHorizontal size={18} />
            </div>
          </div>

          {/* body */}
          <div className="px-5">
            <textarea
              ref={textareaRef}
              value={text}
              placeholder="What's new?"
              onChange={(e) => setDraft(e.target.value, images)}
              className="w-full bg-transparent outline-none resize-none"
              style={{ color: tokens.textPrimary }}
            />

            {/* images */}
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img) => (
                  <div key={img.id} className="relative w-24 h-24">
                    <img
                      src={img.previewUrl}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      onClick={() =>
                        setDraft(
                          text,
                          images.filter((i) => i.id !== img.id)
                        )
                      }
                      className="absolute top-1 right-1 bg-black text-white rounded-full p-1"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isEditMode && (
              <ImageUpload images={images} onChange={(imgs) => setDraft(text, imgs)} />
            )}
          </div>

          {/* footer */}
          <div className="flex justify-between items-center px-5 py-4">
            <span style={{ color: tokens.textSecondary }}>
              {remaining}
            </span>

            <Button
              onClick={handlePost}
              disabled={isEmpty || isOver || uploading}
            >
              {uploading ? "Posting..." : isEditMode ? "Save" : "Post"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}