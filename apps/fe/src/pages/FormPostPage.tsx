
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Laugh, AlignLeft, List, MapPin, ChevronRight, FileText, MoreHorizontal, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { usePostStore } from "@/stores/usePostStore";

const MAX_CHARS = 500;
const tokens = {
  bgPrimary: "#101010", bgTertiary: "#1E1E1E", bgElevated: "rgb(24,24,24)",
  textPrimary: "#F3F5F7", textSecondary: "#777777", placeholder: "#8A8D91",
  divider: "#3E4042", threadline: "#333638",
} as const;
const username = "andy";

export default function FormPostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const { draft, setDraft, clearDraft, addPost, updatePost, posts } = usePostStore();
  const text = draft.text;
  const images = draft.images;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - text.length;
  const isOver = remaining < 0;
  const isEmpty = text.trim().length === 0 && images.length === 0;
  const isEditMode = !!editId;

  // Load existing post data jika mode edit
  useEffect(() => {
    if (editId) {
      const existingPost = posts.find((p) => p.id === editId);
      if (existingPost) {
        setDraft(existingPost.text, existingPost.images);
      }
    }
  }, [editId]);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }
  }, [text]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value, images);
    autoResize();
  };

  const handleImagesChange = (newImages: typeof images) => {
    setDraft(text, newImages);
  };

  const handleRemoveImage = (id: string) => {
    const target = images.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    handleImagesChange(images.filter((i) => i.id !== id));
  };

  const handlePost = () => {
    if (isEmpty || isOver) return;
    if (isEditMode && editId) {
      updatePost(editId, text.trim());
    } else {
      addPost(text.trim(), images, username);
    }
    clearDraft();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex justify-center" style={{ backgroundColor: tokens.bgPrimary }}>
      <div className="w-full max-w-[560px] px-4 py-6">
        <div className="rounded-2xl overflow-hidden border" style={{ backgroundColor: tokens.bgTertiary, borderColor: tokens.divider, fontFamily: "system-ui, -apple-system, sans-serif" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <button onClick={() => { clearDraft(); navigate(-1); }}
              style={{ fontSize: 15, color: tokens.textPrimary }} className="hover:opacity-70 transition-opacity">
              Cancel
            </button>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: tokens.textPrimary }}>
              {isEditMode ? "Edit thread" : "New thread"}
            </h1>
            <div className="flex items-center gap-3">
              <button type="button" style={{ color: tokens.textSecondary }}><FileText size={20} /></button>
              <button type="button" style={{ color: tokens.textSecondary }}><MoreHorizontal size={20} /></button>
            </div>
          </div>

          {/* Composer */}
          <div className="flex gap-3 px-5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500"
                style={{ fontSize: 15, fontWeight: 700, color: tokens.textPrimary }}>
                {username[0].toUpperCase()}
              </div>
              <div className="w-0.5 flex-1 rounded-full mt-2 min-h-8" style={{ backgroundColor: tokens.threadline }} />
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-1 mb-1">
                <span style={{ fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>{username}</span>
                <ChevronRight size={14} style={{ color: tokens.textSecondary }} />
                <button type="button" style={{ fontSize: 15, color: tokens.textSecondary }} className="hover:opacity-80">Add a topic</button>
              </div>
              <textarea ref={textareaRef} value={text} rows={2} placeholder="What's new?"
                onChange={handleTextChange}
                className="w-full bg-transparent resize-none outline-none overflow-hidden"
                style={{ fontSize: 15, lineHeight: "21px", color: tokens.textPrimary, caretColor: tokens.textPrimary }}
                aria-label="Post content" />
              <style>{`textarea::placeholder { color: ${tokens.placeholder}; }`}</style>

              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {images.map((img) => (
                    <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden" style={{ backgroundColor: tokens.bgElevated }}>
                      <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" draggable={false} />
                      <button type="button" onClick={() => handleRemoveImage(img.id)}
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: tokens.textPrimary }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-0.5 mt-3">
                <div className="w-0.5 h-5 rounded-full mr-2" style={{ backgroundColor: tokens.threadline }} />
                {!isEditMode && <ImageUpload images={images} onChange={handleImagesChange} />}
                <button type="button" className="p-1.5 rounded-lg" style={{ color: tokens.textSecondary }}>
                  <span className="border rounded px-0.5 leading-none" style={{ fontSize: 11, fontWeight: 700, borderColor: "currentColor" }}>GIF</span>
                </button>
                {([["Emoji", Laugh], ["Formatting", AlignLeft], ["Poll", List], ["Location", MapPin]] as const).map(([label, Icon]) => (
                  <button key={label} type="button" aria-label={label} className="p-1.5 rounded-lg" style={{ color: tokens.textSecondary }}>
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add to thread */}
          {!isEditMode && (
            <div className="flex items-center gap-3 px-5 py-3">
              <div className="w-10 flex justify-center">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500"
                  style={{ fontSize: 10, fontWeight: 700, color: tokens.textPrimary }}>
                  {username[0].toUpperCase()}
                </div>
              </div>
              <button type="button" style={{ fontSize: 15, color: tokens.textSecondary }} className="hover:opacity-80">Add to thread</button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-5 pb-5 pt-1">
            <button type="button" className="flex items-center gap-2 hover:opacity-80" style={{ fontSize: 15, color: tokens.textSecondary }}>
              <LayoutGrid size={18} /> Options
            </button>
            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: isOver ? "hsl(350,87%,55%)" : remaining <= 20 ? "#F59E0B" : tokens.textSecondary }} aria-live="polite">
                  {remaining}
                </span>
              )}
              <Button onClick={handlePost} disabled={isEmpty || isOver}
                style={{ fontSize: 15, fontWeight: 600, backgroundColor: tokens.textPrimary, color: tokens.bgPrimary, borderRadius: 12, padding: "8px 20px", opacity: isEmpty || isOver ? 0.3 : 1, cursor: isEmpty || isOver ? "not-allowed" : "pointer" }}>
                {isEditMode ? "Save" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
