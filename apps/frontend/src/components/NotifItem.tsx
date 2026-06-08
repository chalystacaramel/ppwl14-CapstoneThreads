// apps/frontend/src/components/NotifItem.tsx
import { useState } from "react";
import { Heart, MessageCircle, UserPlus } from "lucide-react";

export type NotifType = "like" | "comment" | "follow";

export interface NotifItemProps {
  id: string;
  type: NotifType;
  fromUser: string;
  avatarUrl?: string;  // FIX: tambah avatarUrl
  message: string;
  createdAt: string;
  read: boolean;
}

const iconMap = {
  like: <Heart size={14} className="text-[#FF2E40]" fill="#FF2E40" />,
  comment: <MessageCircle size={14} className="text-[#1877F2]" />,
  follow: <UserPlus size={14} className="text-[#31A24C]" />,
};

const formatTime = (iso: string) => {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  const diffH = Math.floor(diffMin / 60);
  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} mnt`;
  if (diffH < 24) return `${diffH} jam`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};

// FIX: Avatar dengan referrerPolicy dan fallback
function Avatar({ url, name }: { url?: string; name: string }) {
  const [err, setErr] = useState(false);
  const initial = (name ?? "?").charAt(0).toUpperCase();
  if (url && !err) {
    return (
      <img
        src={url}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setErr(true)}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#333638] flex items-center justify-center text-sm font-semibold text-[#F3F5F7]">
      {initial}
    </div>
  );
}

export default function NotifItem({ type, fromUser, avatarUrl, message, createdAt, read }: NotifItemProps) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-[#3E4042] ${!read ? "bg-[#1a1a1a]" : ""} hover:bg-[#1E1E1E] transition-colors`}>
      <div className="relative shrink-0">
        <Avatar url={avatarUrl} name={fromUser} />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#101010] flex items-center justify-center">
          {iconMap[type]}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#F3F5F7]">{fromUser}</span>
          <span className="text-xs text-[#777] shrink-0">{formatTime(createdAt)}</span>
        </div>
        <p className="text-sm text-[#999] mt-0.5">{message}</p>
      </div>
      {!read && <div className="w-2 h-2 rounded-full bg-[#1877F2] shrink-0 mt-2" />}
    </div>
  );
}