import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Repeat2, Send, MoreHorizontal, Pencil, Trash2, X, ImagePlus } from "lucide-react";
import CommentCard from "@/components/CommentCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePostStore } from "@/stores/usePostStore";
import { useLike } from "@/hooks/useLike";
import { BACKEND_URL } from "@/constants";
import { usePost } from "@/hooks/usePost";
import type { Comment } from "@/types";
import { defAvatar } from "@/lib/utils";

const MAX_COMMENTS = 5;

export default function DetailPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const post = usePostStore((s) => s.post);
  const { toggleLike } = useLike();
  const { loading, fetchPost, updatePost } = usePost();
  const editPostFileInputRef = useRef<HTMLInputElement>(null);

  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [removePostImage, setRemovePostImage] = useState(false);

  const isPostOwner = user && post && user.id === post.userId;

  const userCommentCount = post?.user
    ? comments.filter((c) => c.userId === post.userId).length
    : 0;
  const canComment = userCommentCount < MAX_COMMENTS;

  const fetchingPost = () => {
    if (id) {
      const postId = Number(id);
      fetchPost(postId);
    }
  };

  useEffect(() => {
    fetchingPost();
  }, [id]);

  useEffect(() => {
    if (post) {
      // 1. Set jumlah total like langsung dari counter database store
      setLikeCount(post._count?.likes ?? 0);
      
      // 2. Periksa apakah ID user saat ini terdaftar di dalam array list liking post
      if (user && post.likes) {
        const isUserLiked = post.likes.some((l) => l.userId === user.id);
        setLiked(isUserLiked);
      } else {
        setLiked(false);
      }
    }
  }, [post, user]);

  const handleLikeClick = (e: React.MouseEvent) => {
    if (!post) return;
    e.stopPropagation();
    toggleLike(Number(post.id), liked);
  };

  const handleEditPost = async () => {
    if (!token || !post || !editContent.trim()) return;

    try {
      // 1. Jalankan updatePost dan berikan casting 'as any' agar TypeScript tidak menganggapnya 'void'
      const updatedData = await (updatePost(post.id, editContent, editImage) as any);
      
      // 2. Gunakan usePostStore untuk memperbarui data secara langsung jika updatedData ada
      if (updatedData) {
        usePostStore.setState({ post: updatedData });
      }

      // 3. Tutup form edit dan bersihkan state temporary
      setIsEditing(false);
      setEditImage(null);
      setRemovePostImage(false);

    } catch (error) {
      console.error("Gagal menyimpan perubahan postingan:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !canComment || !token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/posts/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        const comment: Comment = {
          id: data.id,
          postId: Number(id),
          userId: user!.id,
          content: data.content,
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
          user: user!,
        };
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
      } else {
        console.error("Gagal kirim komentar:", data.message);
      }
    } catch (err) {
      console.error("Gagal kirim komentar:", err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/posts/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Gagal hapus komentar:", err);
    }
  };

  const handleEditComment = async (
    commentId: number,
    newContent: string,
    newImage?: File | null,
    removeImage?: boolean
  ) => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append("content", newContent);
      if (newImage) formData.append("image", newImage);
      if (removeImage) formData.append("remove_image", "yes");

      const res = await fetch(`${BACKEND_URL}/posts/comments/${commentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, content: data.content, image_url: data.image_url }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Gagal edit komentar:", err);
    }
  };

  const handleDeletePost = async () => {
    if (!token || !post) return;
    try {
      const res = await fetch(`${BACKEND_URL}/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) navigate("/");
    } catch (err) {
      console.error("Gagal hapus post:", err);
    }
  };

  if (loading || !post) {
    return (
      <div className="min-h-screen bg-[#101010] text-[#F3F5F7] flex items-center justify-center">
        <p className="text-sm text-[#777]">Memuat thread...</p>
      </div>
    );
  }

  // Gambar yang ditampilkan saat mode edit post
  const editPreviewSrc = editImage
    ? URL.createObjectURL(editImage)
    : !removePostImage && post.image_url
    ? post.image_url
    : null;

  return (
    <div className="min-h-screen bg-[#101010] text-[#F3F5F7]">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-[#101010]/90 backdrop-blur border-b border-[#3E4042] flex items-center gap-4 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-[#1E1E1E] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-base font-semibold">Thread</span>
      </div>

      <div className="max-w-xl mx-auto pb-24">

        {/* Section: Detail Post */}
        <div className="px-4 pt-4 pb-3 border-b border-[#3E4042]">
          <div className="flex items-start gap-3">
            <img
              src={post.user?.avatar_url ?? defAvatar(post.user?.avatar_url ?? "")}
              alt="avatar"
              loading="lazy"
              className="rounded-full w-10 h-10 bg-[#333638]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{post?.user?.name ?? ""}</span>
                <div className="flex items-center gap-2 text-[#777]">
                  <span className="text-xs">
                    {new Date(post.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-[#1E1E1E] rounded-full transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#1E1E1E] border-[#3E4042] text-[#F3F5F7] rounded-2xl w-48"
                    >
                      {isPostOwner ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setIsEditing(true);
                              setEditContent(post.content);
                              setEditImage(null);
                              setRemovePostImage(false);
                            }}
                            className="hover:bg-[#333638] rounded-xl cursor-pointer flex items-center gap-2"
                          >
                            <Pencil size={14} /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDeletePost}
                            className="text-[#FF2E40] hover:bg-[#333638] rounded-xl cursor-pointer flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Hapus
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem className="hover:bg-[#333638] rounded-xl cursor-pointer">
                            Simpan
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-[#333638] rounded-xl cursor-pointer">
                            Salin tautan
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-[#333638] rounded-xl cursor-pointer">
                            Tidak tertarik
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[#FF2E40] hover:bg-[#333638] rounded-xl cursor-pointer">
                            Laporkan
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 ml-13">
            {isEditing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-[#1E1E1E] border border-[#3E4042] rounded-xl px-3 py-2 text-[15px] text-[#F3F5F7] resize-none outline-none min-h-20"
                />

                {/* Preview gambar saat edit */}
                {editPreviewSrc && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={editPreviewSrc}
                      alt="preview"
                      className="rounded-2xl max-w-full max-h-60 object-cover"
                    />
                    <button
                      onClick={() => {
                        if (editImage) setEditImage(null);
                        else setRemovePostImage(true);
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1.5 text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Tombol tambah/ganti gambar */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => editPostFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-sm text-[#777] hover:text-[#F3F5F7] transition-colors"
                  >
                    <ImagePlus size={16} />
                    {editPreviewSrc ? "Ganti gambar" : "Tambah gambar"}
                  </button>
                </div>

                <input
                  ref={editPostFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (!file) return;
                    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                    if (!allowed.includes(file.type)) {
                      alert("Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.");
                      return;
                    }
                    if (file.size > 8 * 1024 * 1024) {
                      alert("Ukuran gambar maksimal 8MB.");
                      return;
                    }
                    setEditImage(file);
                    setRemovePostImage(false);
                    e.target.value = "";
                  }}
                />

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleEditPost}
                    className="px-4 py-1.5 bg-[#F3F5F7] text-[#101010] text-sm font-semibold rounded-xl hover:bg-white transition-colors"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditImage(null);
                      setRemovePostImage(false);
                    }}
                    className="px-4 py-1.5 bg-[#1E1E1E] text-[#777] text-sm rounded-xl hover:bg-[#333638] transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[15px] leading-5 whitespace-pre-wrap">{post.content}</p>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="mt-3 rounded-2xl max-w-full max-h-100 object-cover"
                  />
                )}
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="ml-13 mt-3 flex items-center gap-4">
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-1.5 text-[#777] hover:text-[#FF2E40] transition-colors"
            >
              <Heart size={20} className={liked ? "fill-[#FF2E40] text-[#FF2E40]" : ""} />
              <span className="text-sm">{likeCount}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[#777] hover:text-[#F3F5F7] transition-colors">
              <MessageCircle size={20} />
              <span className="text-sm">{comments.length}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[#777] hover:text-[#F3F5F7] transition-colors">
              <Repeat2 size={20} />
            </button>
            <button className="flex items-center gap-1.5 text-[#777] hover:text-[#F3F5F7] transition-colors">
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Section: Input Komentar */}
        <div className="px-4 py-3 border-b border-[#3E4042]">
          <div className="flex items-start gap-3">
            <img
              src={post.user?.avatar_url ?? defAvatar(post.user?.avatar_url ?? "")}
              alt="avatar"
              loading="lazy"
              className="rounded-full w-8 h-8 bg-[#333638]"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  !token
                    ? "Silakan login untuk memberikan komentar"
                    : canComment
                    ? `Balas sebagai ${user?.name}...`
                    : "Kamu sudah mencapai batas 5 komentar"
                }
                disabled={!canComment || !token}
                rows={2}
                className="w-full bg-transparent text-[15px] text-[#F3F5F7] placeholder:text-[#777] resize-none outline-none disabled:opacity-50"
              />
              {!token ? (
                <p className="text-xs text-[#777] mt-1">Gunakan akun Anda untuk berdiskusi</p>
              ) : !canComment ? (
                <p className="text-xs text-[#FF2E40] mt-1">Batas komentar (5) sudah tercapai</p>
              ) : (
                <p className="text-xs text-[#777] mt-1">
                  Sisa komentar: {MAX_COMMENTS - userCommentCount}
                </p>
              )}
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || !canComment || !token}
              className="px-4 py-1.5 rounded-full bg-[#F3F5F7] text-[#101010] text-sm font-semibold disabled:opacity-30 hover:bg-white transition-colors shrink-0"
            >
              Kirim
            </button>
          </div>
        </div>

        {/* Section: Jumlah Komentar */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-[#3E4042]">
          <span className="text-sm text-[#777]">{comments.length} komentar</span>
          <button className="text-sm text-[#777] flex items-center gap-1 hover:text-[#F3F5F7] transition-colors">
            ↕ Terbaru
          </button>
        </div>

        {/* Section: List Komentar */}
        <div>
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#777]">
              <MessageCircle size={40} className="mb-3 opacity-50" />
              <p className="text-sm">Belum ada komentar</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
                onEdit={handleEditComment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}