import { Bell } from "lucide-react";
import NotifItem, { type NotifItemProps } from "@/components/NotifItem";

const DUMMY_NOTIFS: NotifItemProps[] = [
  {
    id: "n1",
    type: "like",
    fromUser: "Aisyah",
    message: "menyukai postinganmu.",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    read: false,
  },
  {
    id: "n2",
    type: "comment",
    fromUser: "Chalysta",
    message: "mengomentari postinganmu: \"Keren banget!\"",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    read: false,
  },
  {
    id: "n3",
    type: "follow",
    fromUser: "Andy",
    message: "mulai mengikutimu.",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    read: true,
  },
  {
    id: "n4",
    type: "like",
    fromUser: "Adhelia",
    message: "menyukai komentarmu.",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    read: true,
  },
];

export default function NotifPage() {
  const unreadCount = DUMMY_NOTIFS.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#101010] text-[#F3F5F7]">
      {/* Header */}
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
        {DUMMY_NOTIFS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#777]">
            <Bell size={40} className="mb-3 opacity-50" />
            <p className="text-sm">Belum ada notifikasi</p>
          </div>
        ) : (
          DUMMY_NOTIFS.map((notif) => (
            <NotifItem key={notif.id} {...notif} />
          ))
        )}
      </div>
    </div>
  );
}