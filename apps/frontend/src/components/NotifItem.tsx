import { Heart, MessageCircle, UserPlus } from "lucide-react";

export type NotifItemProps = {
  id: string;
  type: "like" | "comment" | "follow";
  fromUser: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function NotifItem({ type, fromUser, message, createdAt, read }: NotifItemProps) {
  const icon = type === "like" ? <Heart size={16} className="text-red-500" />
    : type === "comment" ? <MessageCircle size={16} className="text-blue-400" />
    : <UserPlus size={16} className="text-green-400" />;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-[#3E4042] ${!read ? "bg-[#1a1a1a]" : ""}`}>
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm"><span className="font-semibold">{fromUser}</span> {message}</p>
        <p className="text-xs text-[#777] mt-0.5">{new Date(createdAt).toLocaleString("id-ID")}</p>
      </div>
      {!read && <div className="w-2 h-2 rounded-full bg-[#1877F2] mt-2" />}
    </div>
  );
}