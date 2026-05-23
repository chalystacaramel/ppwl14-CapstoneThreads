import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import NotifItem, { type NotifItemProps } from "@/components/NotifItem";
import { useAuthStore } from "@/stores/auth.store";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function NotifPage() {
  const { accessToken } = useAuthStore();
  const [notifs, setNotifs] = useState<NotifItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotifs() {
    if (!accessToken) return;
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifs(data.map((n: any) => ({
          id: n.id,
          type: n.type,
          fromUser: n.actor?.name ?? "Someone",
          message: n.type === "comment" ? "mengomentari postinganmu." : "menyukai postinganmu.",
          createdAt: n.createdAt,
          read: n.isRead,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNotifs(); }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#101010] text-[#F3F5F7]">
      <div className="sticky top-0 z-10 bg-[#101010]/90 backdrop-blur border-b border-[#3E4042] px-4 py-3">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <h1 className="text-xl font-bold">Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="text-xs bg-[#1877F2] text-white px-2 py-0.5 rounded-full font-semibold">
              {unreadCount} baru
            </span>
          )}
        </div>
      </div>
      <div className="max-w-xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-24 text-[#777]">
            <p className="text-sm">Memuat notifikasi...</p>
          </div>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#777]">
            <Bell size={40} className="mb-3 opacity-50" />
            <p className="text-sm">Belum ada notifikasi</p>
          </div>
        ) : (
          notifs.map((notif) => <NotifItem key={notif.id} {...notif} />)
        )}
      </div>
    </div>
  );
}