// apps/frontend/src/pages/NotifPage.tsx
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import NotifItem from "@/components/NotifItem"
import { useAuthStore } from "@/stores/auth.store"
import { BACKEND_URL } from "@/constants"

interface Notif {
  id: string
  type: "like" | "comment" | "follow"
  isRead: boolean
  createdAt: string
  actor: { id: string; name: string; avatarUrl?: string; username: string }
  post?: { id: string; content: string } | null
}

export default function NotifPage() {
  const { accessToken } = useAuthStore()
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    setLoading(true)
    fetch(`${BACKEND_URL}/notifications`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => setNotifs(Array.isArray(data) ? data : []))
      .catch(() => setError("Gagal memuat notifikasi"))
      .finally(() => setLoading(false))
  }, [accessToken])

  const markAllRead = async () => {
    if (!accessToken) return
    await fetch(`${BACKEND_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifs.filter((n) => !n.isRead).length

  return (
    <div className="min-h-screen bg-[#101010] text-[#F3F5F7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#101010]/90 backdrop-blur border-b border-[#3E4042] px-4 py-3">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <h1 className="text-xl font-bold">Notifikasi</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-[#1877F2] font-semibold"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#333] border-t-[#f3f3f3] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-center text-[#777] py-16 text-sm">{error}</p>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#777]">
            <Bell size={40} className="mb-3 opacity-50" />
            <p className="text-sm">Belum ada notifikasi</p>
          </div>
        ) : (
          notifs.map((n) => (
            <NotifItem
              key={n.id}
              id={n.id}
              type={n.type}
              fromUser={n.actor.name}
              message={
                n.type === "like"
                  ? "menyukai postinganmu."
                  : n.type === "comment"
                  ? `mengomentari: "${n.post?.content ?? ""}"`
                  : "mulai mengikutimu."
              }
              createdAt={n.createdAt}
              read={n.isRead}
            />
          ))
        )}
      </div>
    </div>
  )
}