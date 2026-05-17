import { useEffect, useState, useCallback } from 'react'
import ThreadCard from '../components/ThreadCard'
import type { ThreadPost } from '../components/ThreadCard'
import { useAuthStore } from '../stores/auth.store'

// ─── Config ───────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

// ─── Dummy Data (untuk testing GET sebelum BE ready) ──────────
const DUMMY_POSTS: ThreadPost[] = [
  {
    id: 'd1',
    user: { id: 'u1', name: 'Aisyah Putri', username: 'aisyah_p', avatarUrl: undefined },
    content: 'Selamat datang di Threads Clone! 🎉 Ini postingan pertama di beranda kita.',
    likeCount: 24,
    commentCount: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    isLiked: false,
  },
  {
    id: 'd2',
    user: { id: 'u2', name: 'Andy Wirawan', username: 'andy_w', avatarUrl: undefined },
    content: 'Lagi ngerjain frontend Threads buat tugas PPWL. Stack-nya Vite + React + Tailwind + ShadcnUI. Keren banget sih 🔥',
    likeCount: 41,
    commentCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    isLiked: true,
  },
  {
    id: 'd3',
    user: { id: 'u3', name: 'Iqlima Sari', username: 'iqlima_s', avatarUrl: undefined },
    content: 'Backend ElysiaJS + Prisma ORM udah berjalan di localhost:3000 ✅\nTinggal connect ke frontend nih!',
    likeCount: 18,
    commentCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isLiked: false,
  },
  {
    id: 'd4',
    user: { id: 'u4', name: 'Adhelia Nur', username: 'adhelia_n', avatarUrl: undefined },
    content: 'Login pakai Google OAuth udah jalan! 🎊 Zustand persist juga works setelah refresh. Next: bikin halaman beranda yang mirip Threads beneran.',
    likeCount: 56,
    commentCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    isLiked: false,
  },
  {
    id: 'd5',
    user: { id: 'u5', name: 'Sheren Ayu', username: 'sheren_a', avatarUrl: undefined },
    content: 'Deploy ke AWS Lambda + S3 target minggu ini. Semangat! 💪',
    likeCount: 33,
    commentCount: 7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isLiked: false,
  },
]

// ─── API Helpers ───────────────────────────────────────────────
async function fetchPosts(token?: string | null): Promise<ThreadPost[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/posts`, { headers })
  if (!res.ok) throw new Error('Gagal mengambil postingan')
  const data = await res.json()

  // Normalise response — backend bisa kembalikan array atau { posts: [] }
  const raw: any[] = Array.isArray(data) ? data : (data.posts ?? data.data ?? [])
  return raw.map((p: any): ThreadPost => ({
    id: String(p.id),
    user: {
      id: String(p.user?.id ?? p.userId ?? ''),
      name: p.user?.name ?? 'Pengguna',
      username: p.user?.username,
      avatarUrl: p.user?.avatarUrl ?? p.user?.avatar_url,
    },
    content: p.content ?? '',
    imageUrl: p.imageUrl ?? p.image_url,
    likeCount: p._count?.likes ?? p.likeCount ?? p.like_count ?? 0,
    commentCount: p._count?.comments ?? p.commentCount ?? p.comment_count ?? 0,
    createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
    isLiked: p.isLiked ?? false,
  }))
}

async function toggleLike(postId: string, token: string): Promise<void> {
  await fetch(`${BASE_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  })
}

// ─── Threads Logo kecil ────────────────────────────────────────
function MiniLogo() {
  return (
    <svg viewBox="0 0 192 192" width={28} height={28} fill="currentColor">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.23c8.25.053 14.476 2.452 18.502 7.13 2.932 3.405 4.893 8.11 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z" />
    </svg>
  )
}

// ─── Skeleton Loader ──────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={s.skeletonCard}>
      <div style={s.skeletonAvatar} />
      <div style={{ flex: 1 }}>
        <div style={{ ...s.skeletonLine, width: '40%', marginBottom: 8 }} />
        <div style={{ ...s.skeletonLine, width: '90%', marginBottom: 6 }} />
        <div style={{ ...s.skeletonLine, width: '70%' }} />
      </div>
    </div>
  )
}

// ─── Main Feed ────────────────────────────────────────────────
export default function Feed() {
  const [posts, setPosts] = useState<ThreadPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useDummy, setUseDummy] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { token } = useAuthStore()

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const data = await fetchPosts(token)
      if (data.length === 0 && !isRefresh) {
        // Backend belum ada data — pakai dummy
        setPosts(DUMMY_POSTS)
        setUseDummy(true)
      } else {
        setPosts(data)
        setUseDummy(false)
      }
    } catch {
      // Fallback ke dummy jika backend belum ready
      setPosts(DUMMY_POSTS)
      setUseDummy(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => { loadPosts() }, [loadPosts])

  // Pull to refresh (desktop: klik tombol refresh)
  const handleRefresh = () => loadPosts(true)

  const handleLike = async (postId: string) => {
    if (!token) return
    await toggleLike(postId, token)
  }

  return (
    <div style={s.page}>
      {/* Mobile header */}
      <header style={s.mobileHeader} className="threads-mobile-header">
        <div style={s.mobileHeaderInner}>
          <MiniLogo />
        </div>
      </header>

      {/* Feed container */}
      <main style={s.feedWrap}>
        {/* Tab bar — "Untuk Anda" dan "Mengikuti" */}
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...s.tabActive }}>Untuk Anda</button>
          <button style={s.tab}>Mengikuti</button>
        </div>

        {/* Dummy data badge */}
        {useDummy && (
          <div style={s.dummyBanner}>
            📝 Menampilkan data dummy — backend belum terhubung
          </div>
        )}

        {/* Refresh indicator */}
        {refreshing && (
          <div style={s.refreshBar}>
            <div style={s.refreshDot} />
            <span style={{ fontSize: 13, color: '#555' }}>Memperbarui...</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <div style={s.errorBox}>
            <p style={{ color: '#ff6666', fontSize: 14, marginBottom: 12 }}>{error}</p>
            <button style={s.retryBtn} onClick={handleRefresh}>Coba lagi</button>
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <ThreadCard
                key={post.id}
                post={post}
                onLike={handleLike}
                showThread={i < posts.length - 1 && Math.random() > 0.6}
              />
            ))}

            {/* Load more / end indicator */}
            <div style={s.endRow}>
              <button style={s.refreshBtnDesktop} onClick={handleRefresh}>
                {refreshing ? 'Memperbarui...' : '↻ Perbarui feed'}
              </button>
            </div>
          </>
        )}
      </main>

      <style>{`
        @media (max-width: 767px) {
          .threads-mobile-header { display: flex !important; }
        }
        @media (min-width: 768px) {
          .threads-mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#101010',
    color: '#f3f3f3',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // Desktop: margin kiri untuk sidebar (72px)
    marginLeft: 0,
  },
  mobileHeader: {
    display: 'none', // shown by @media
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backgroundColor: '#101010',
    borderBottom: '1px solid #1e1e1e',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileHeaderInner: {
    color: '#f3f3f3',
    display: 'flex',
    alignItems: 'center',
  },
  feedWrap: {
    maxWidth: 620,
    margin: '0 auto',
    // Padding bawah untuk mobile bottom nav
    paddingBottom: 72,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #1e1e1e',
    position: 'sticky',
    top: 0,
    backgroundColor: '#101010',
    zIndex: 10,
  },
  tab: {
    flex: 1,
    padding: '14px 0',
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    color: '#f3f3f3',
    borderBottom: '2px solid #f3f3f3',
  },
  dummyBanner: {
    backgroundColor: '#1a1400',
    border: '1px solid #3a2e00',
    color: '#aa8800',
    fontSize: 12,
    padding: '8px 16px',
    textAlign: 'center',
  },
  refreshBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 0',
  },
  refreshDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: '#555',
    animation: 'pulse 1s infinite',
  },
  skeletonCard: {
    display: 'flex',
    gap: 12,
    padding: '16px',
    borderBottom: '1px solid #1e1e1e',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#1e1e1e',
    flexShrink: 0,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1e1e1e',
  },
  errorBox: {
    padding: 32,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: 10,
    color: '#f3f3f3',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: 14,
  },
  endRow: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 0',
  },
  refreshBtnDesktop: {
    background: 'none',
    border: '1px solid #2a2a2a',
    borderRadius: 20,
    color: '#555',
    fontSize: 13,
    padding: '8px 20px',
    cursor: 'pointer',
  },
}
