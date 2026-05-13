import { useState } from "react";
import { Heart, MoreHorizontal } from "lucide-react";
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

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

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
          </div>
        </div>
      </div>
    </div>
  );
}