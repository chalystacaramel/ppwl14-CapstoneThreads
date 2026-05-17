import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react";
import CommentCard from "@/components/CommentCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  author: User;
  createdAt: string;
  likes: { userId: string }[];
}

const DUMMY_POST: Post = {
  id: "1",
  content: "Ini adalah postingan pertama di Threads clone kita! Semoga tugasnya lancar semua ya 🙏",
  author: { id: "u1", name: "Aisyah" },
  createdAt: new Date().toISOString(),
  likes: [{ userId: "u2" }],
};

const CURRENT_USER: User = { id: "u5", name: "Chalysta" };
const MAX_COMMENTS = 5;
const API_URL = "http://localhost:3000";

export default function DetailPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = DUMMY_POST;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_URL}/comments/${id ?? "1"}`);
        const json = await res.json();
        setComments(json.data);
      } catch (err) {
        console.error("Gagal fetch komentar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  const userCommentCount = comments.filter(c => c.author.id === CURRENT_USER.id).length;
  const canComment = userCommentCount < MAX_COMMENTS;

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() || !canComment) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      content: newComment.trim(),
      author: CURRENT_USER,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diffMs = new Date().getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    if (diffMin < 1) return "baru saja";
    if (diffMin < 60) return `${diffMin} menit`;
    if (diffH < 24) return `${diffH} jam`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#101010] text-[#F3F5F7]">
      <div className="sticky top-0 z-10 bg-[#101010]/90 backdrop-blur border-b border-[#3E4042] flex items-center gap-4 px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[#1E1E1E] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="text-base font-semibold">Thread</span>
      </div>

      <div className="max-w-xl mx-auto pb-24">
        {/* Post utama */}
        <div className="px-4 pt-4 pb-3 border-b border-[#3E4042]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#333638] flex items-center justify-center text-sm font-semibold shrink-0">
              {getInitial(post.author.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{post.author.name}</span>
                <div className="flex items-center gap-2 text-[#777]">
                  <span className="text-xs">{formatTime(post.createdAt)}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-[#1E1E1E] rounded-full transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1E1E1E] border-[#3E4042] text-[#F3F5F7] rounded-2xl w-48">
                      <DropdownMenuItem className="hover:bg-[#333638] rounded-xl cursor-pointer">Simpan</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-[#333638] rounded-xl cursor-pointer">Salin tautan</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-[#333638] rounded-xl cursor-pointer">Tidak tertarik</DropdownMenuItem>
                      <DropdownMenuItem className="text-[#FF2E40] hover:bg-[#333638] rounded-xl cursor-pointer">Laporkan</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 ml-13">
            <p className="text-[15px] leading-5 whitespace-pre-wrap">{post.content}</p>
            {post.image && (
              <img src={post.image} alt="Post" className="mt-3 rounded-2xl max-w-full max-h-100 object-cover" />
            )}
          </div>

          <div className="ml-13 mt-3 flex items-center gap-4">
            <button onClick={handleLike} className="flex items-center gap-1.5 text-[#777] hover:text-[#FF2E40] transition-colors">
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

        {/* Form komentar */}
        <div className="px-4 py-3 border-b border-[#3E4042]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#333638] flex items-center justify-center text-xs font-semibold shrink-0">
              {getInitial(CURRENT_USER.name)}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={canComment ? `Balas sebagai ${CURRENT_USER.name}...` : "Kamu sudah mencapai batas 5 komentar"}
                disabled={!canComment}
                rows={2}
                className="w-full bg-transparent text-[15px] text-[#F3F5F7] placeholder:text-[#777] resize-none outline-none disabled:opacity-50"
              />
              {!canComment ? (
                <p className="text-xs text-[#FF2E40] mt-1">Batas komentar (5) sudah tercapai</p>
              ) : (
                <p className="text-xs text-[#777] mt-1">Sisa komentar: {MAX_COMMENTS - userCommentCount}</p>
              )}
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || !canComment}
              className="px-4 py-1.5 rounded-full bg-[#F3F5F7] text-[#101010] text-sm font-semibold disabled:opacity-30 hover:bg-white transition-colors shrink-0"
            >
              Kirim
            </button>
          </div>
        </div>

        {/* Sort komentar */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-[#3E4042]">
          <span className="text-sm text-[#777]">{comments.length} komentar</span>
          <button className="text-sm text-[#777] flex items-center gap-1 hover:text-[#F3F5F7] transition-colors">
            ↕ Terbaru
          </button>
        </div>

        {/* Daftar komentar */}
        <div>
          {loading ? (
            <div className="flex justify-center py-16">
              <p className="text-sm text-[#777]">Memuat komentar...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#777]">
              <MessageCircle size={40} className="mb-3 opacity-50" />
              <p className="text-sm">Belum ada komentar</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}