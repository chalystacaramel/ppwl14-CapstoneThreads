// apps/frontend/src/pages/NotifPage.tsx
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { BACKEND_URL } from "@/constants"

interface Notif {
  id: string
  type: "like" | "comment" | "follow"
  isRead: boolean
  createdAt: string
  actor: { id: string; name: string; avatarUrl?: string; username: string }
  post?: { id: string; content: string } | null
  comment?: { id: string; content: string } | null
}

function timeAgo(date: string): string {
  const d = new Date(date)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return "baru saja"
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam`
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

function NotifIcon({ type }: { type: string }) {
  if (type === "like") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff3040" stroke="#ff3040" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
  if (type === "comment") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#31A24C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Avatar({ url, name }: { url?: string; name: string }) {
  const [err, setErr] = useState(false)
  if (url && !err) {
    return (
      <img
        src={url}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setErr(true)}
        className="w-10 h-10 rounded-full object-cover"
      />
    )
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-sm font-bold text-[#aaa]">
      {name.charAt(0).toUpperCase()}
    </div>
  )
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
    try {
      const res = await fetch(`${BACKEND_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
      if (res.ok) {
        setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })))
      }
    } catch (err) {
      console.error("Error tandai semua dibaca:", err)
    }
  }

  const unreadCount = notifs.filter((n) => !n.isRead).length

  // FIX: pesan notifikasi sekarang pakai isi komentar, bukan isi post
  const getMessage = (n: Notif): string => {
    if (n.type === "like") return "menyukai postinganmu."
    if (n.type === "comment") {
      const commentText = n.comment?.content
      if (commentText) return `mengomentari: "${commentText}"`
      return "mengomentari postinganmu."
    }
    return "mulai mengikutimu."
  }

  return (
    <div className="min-h-screen bg-[#101010] text-[#F3F5F7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#101010]/90 backdrop-blur border-b border-[#3E4042] px-4 py-3">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          <h1 className="text-xl font-bold">Notifikasi</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-[#1877F2] font-semibold hover:text-[#18A3FE] transition-colors px-2 py-1 rounded-lg hover:bg-[#1877F2]/10"
            >
              Tandai semua dibaca ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto divide-y divide-[#1e1e1e]">
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
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 transition-colors ${!n.isRead ? "bg-[#1a1a1a]" : ""}`}
            >
              {/* Avatar + icon badge */}
              <div className="relative flex-shrink-0">
                <Avatar url={n.actor.avatarUrl} name={n.actor.name} />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1E1E1E] flex items-center justify-center">
                  <NotifIcon type={n.type} />
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[#F3F5F7] leading-snug">
                  <span className="font-semibold">{n.actor.name}</span>{" "}
                  <span className="text-[#aaa]">{getMessage(n)}</span>
                </p>
                <p className="text-[12px] text-[#555] mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>

              {/* Unread dot */}
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-[#1877F2] flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}