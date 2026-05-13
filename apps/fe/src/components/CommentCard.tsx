import { useState } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
import CommentReply from "@/components/CommentReply";
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
  parentId?: string | null;
  replies: Comment[];
}

interface CommentCardProps {
  comment: Comment;
  currentUserId: string;
  onAddReply: (parentId: string, content: string) => void;
  canComment: boolean;
}

export default function CommentCard({ comment, currentUserId, onAddReply, canComment }: CommentCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

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

  const handleSubmitReply = () => {
    if (!replyText.trim() || !canComment) return;
    onAddReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReplyForm(false);
  };

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-[#333638] flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitial(comment.author.name)}
          </div>
          <div className="w-px flex-1 bg-[#3E4042] mt-2" />
        </div>

        <div className="flex-1 min-w-0 pb-3">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-semibold">{comment.author.name}</span>
            <div className="flex items-center gap-1.5 text-[#777]">
              <span className="text-xs">{formatTime(comment.createdAt)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-[#1E1E1E] rounded-full transition-colors">
                    <MoreHorizontal size={16} />
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

          <p className="text-[15px] leading-5 text-[#F3F5F7] mb-2">{comment.content}</p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setLiked(p => !p); setLikeCount(p => liked ? p - 1 : p + 1); }}
              className="flex items-center gap-1 text-[#777] hover:text-[#FF2E40] transition-colors"
            >
              <Heart size={16} className={liked ? "fill-[#FF2E40] text-[#FF2E40]" : ""} />
              {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
            </button>
            <button
              onClick={() => setShowReplyForm(p => !p)}
              disabled={!canComment}
              className="text-xs text-[#777] hover:text-[#F3F5F7] transition-colors disabled:opacity-40"
            >
              Balas
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-2 flex items-start gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Tulis balasan..."
                rows={2}
                className="flex-1 bg-[#1E1E1E] text-[14px] text-[#F3F5F7] placeholder:text-[#777] resize-none outline-none rounded-xl px-3 py-2 border border-[#3E4042] focus:border-[#777] transition-colors"
              />
              <div className="flex flex-col gap-1">
                <button onClick={handleSubmitReply} disabled={!replyText.trim()} className="px-3 py-1.5 rounded-full bg-[#F3F5F7] text-[#101010] text-xs font-semibold disabled:opacity-30 hover:bg-white transition-colors">
                  Kirim
                </button>
                <button onClick={() => { setShowReplyForm(false); setReplyText(""); }} className="px-3 py-1.5 rounded-full text-[#777] text-xs hover:text-[#F3F5F7] transition-colors">
                  Batal
                </button>
              </div>
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentReply
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  onAddReply={onAddReply}
                  canComment={canComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}