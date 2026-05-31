import { useState, useRef } from "react";
import { Heart, Image as ImageIcon, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";
import { Comment } from "@/types";

interface CommentCardProps {
  comment: Comment;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, newContent: string, newImage?: File | null, removeImage?: boolean) => void;
}

export default function CommentCard({ comment, onDelete, onEdit }: CommentCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const isOwner = user && String(user.id) === String(comment.userId);

  const formatTime = (iso: string | Date) => {
    const d = new Date(iso as string);
    const diffMs = new Date().getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    if (diffMin < 1) return "baru saja";
    if (diffMin < 60) return `${diffMin} menit`;
    if (diffH < 24) return `${diffH} jam`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !onEdit) return;
    onEdit(comment.id, editContent.trim(), editImage, removeImage);
    setIsEditing(false);
    setEditImage(null);
    setRemoveImage(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setEditImage(null);
    setRemoveImage(false);
  };

  // Gambar yang ditampilkan saat edit: preview baru > gambar lama (jika belum dihapus)
  const previewSrc = editImage
    ? URL.createObjectURL(editImage)
    : (!removeImage && comment.image_url) ? comment.image_url : null;

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-[#333638] flex items-center justify-center text-xs font-semibold shrink-0">
            {(comment.user?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="w-px flex-1 bg-[#3E4042] mt-2" />
        </div>

        <div className="flex-1 min-w-0 pb-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-semibold">{comment.user?.name ?? ""}</span>
            <div className="flex items-center gap-1.5 text-[#777]">
              <span className="text-xs">
                {new Date(comment.createdAt as string).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-[#1E1E1E] rounded-full transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1E1E1E] border-[#3E4042] text-[#F3F5F7] rounded-2xl w-48">
                  <DropdownMenuItem className="hover:bg-[#333638] rounded-xl cursor-pointer">
                    Salin tautan
                  </DropdownMenuItem>
                  {isOwner ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => { setIsEditing(true); setEditContent(comment.content); }}
                        className="hover:bg-[#333638] rounded-xl cursor-pointer flex items-center gap-2"
                      >
                        <Pencil size={14} /> Edit
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(comment.id)}
                          className="text-[#FF2E40] hover:bg-[#333638] rounded-xl cursor-pointer flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Hapus
                        </DropdownMenuItem>
                      )}
                    </>
                  ) : (
                    <DropdownMenuItem className="text-[#FF2E40] hover:bg-[#333638] rounded-xl cursor-pointer">
                      Laporkan
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-[#3E4042] rounded-xl px-3 py-2 text-sm text-[#F3F5F7] resize-none outline-none min-h-15"
              />

              {/* Preview gambar */}
              {previewSrc && (
                <div className="relative mt-2 inline-block">
                  <img src={previewSrc} alt="preview" className="rounded-xl max-h-48 object-cover" />
                  <button
                    onClick={() => {
                      if (editImage) setEditImage(null);
                      else setRemoveImage(true);
                    }}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Tombol tambah gambar */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-[#777] hover:text-[#F3F5F7] transition-colors"
                >
                  <ImageIcon size={14} />
                  {previewSrc ? "Ganti gambar" : "Tambah gambar"}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0] ?? null;
                  setEditImage(file);
                  if (file) setRemoveImage(false); // kalau upload baru, cancel removeImage
                  e.target.value = ""; // reset agar bisa pilih file yang sama lagi
                }}
              />

              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-[#F3F5F7] text-[#101010] text-xs font-semibold rounded-xl hover:bg-white transition-colors"
                >
                  Simpan
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-[#1E1E1E] text-[#777] text-xs rounded-xl hover:bg-[#333638] transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[15px] leading-5 text-[#F3F5F7] mb-2">{comment.content}</p>
              {comment.image_url && (
                <img
                  src={comment.image_url}
                  alt="comment attachment"
                  className="mt-1 mb-2 rounded-xl max-h-48 object-cover"
                />
              )}
            </>
          )}

          {/* Like */}
          <div className="flex items-center gap-4 mt-1">
            <button
              onClick={() => { setLiked(p => !p); setLikeCount(p => liked ? p - 1 : p + 1); }}
              className="flex items-center gap-1 text-[#777] hover:text-[#FF2E40] transition-colors"
            >
              <Heart size={16} className={liked ? "fill-[#FF2E40] text-[#FF2E40]" : ""} />
              {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}