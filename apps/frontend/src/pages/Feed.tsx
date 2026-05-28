// apps/frontend/src/pages/Feed.tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ThreadCard from '../components/ThreadCard'
import type { ThreadPost } from '../components/ThreadCard'
import { useAuthStore } from '../stores/auth.store'
import { BACKEND_URL } from '../constants'

async function fetchPosts(token?: string | null): Promise<ThreadPost[]> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BACKEND_URL}/posts`, { headers })
  if (!res.ok) throw new Error('Gagal mengambil postingan')
  const data = await res.json()
  const raw: any[] = Array.isArray(data) ? data : (data.posts ?? data.data ?? [])
  return raw.map((p: any): ThreadPost => ({
    id: String(p.id),
    user: {
      id: String(p.user?.id ?? ''),
      name: p.user?.name ?? 'Pengguna',
      username: p.user?.username,
      avatarUrl: p.user?.avatarUrl ?? p.user?.avatar_url,
    },
    content: p.content ?? '',
    imageUrl: p.imageUrl ?? p.image_url,
    likeCount: p._count?.likes ?? p.likeCount ?? 0,
    commentCount: p._count?.comments ?? p.commentCount ?? 0,
    createdAt: p.createdAt ?? new Date().toISOString(),
    isLiked: p.isLiked ?? false,
  }))
}

async function toggleLike(postId: string, token: string): Promise<void> {
  await fetch(`${BACKEND_URL}/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  })
}

// ─── Threadster Logo (mini) ───────────────────────────────────
function ThreadsterMiniLogo() {
  return (
    <svg viewBox="0 0 64 64" width={28} height={28} fill="none">
      <rect x="8" y="10" width="48" height="6" rx="3" fill="currentColor" />
      <rect x="27" y="10" width="10" height="44" rx="5" fill="currentColor" />
      <ellipse cx="32" cy="22" rx="16" ry="5" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
      <ellipse cx="32" cy="42" rx="12" ry="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.35" />
    </svg>
  )
}

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

export default function Feed() {
  const [posts, setPosts]           = useState<ThreadPost[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const { accessToken, logout } = useAuthStore()
  const navigate = useNavigate()

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await fetchPosts(accessToken)
      setPosts(data)
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat postingan')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [accessToken])

  useEffect(() => { loadPosts() }, [loadPosts])

  useEffect(() => {
    const onFocus = () => loadPosts(true)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [loadPosts])

  const handleLike = async (postId: string) => {
    if (!accessToken) return
    await toggleLike(postId, accessToken)
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
        : p
    ))
  }

  return (
    <div style={s.page}>

      {/* Mobile header — hanya tampil di mobile */}
      <header style={s.mobileHeader} className="threadster-mobile-header">
        {/* Logout kiri */}
        <button
          style={s.mobileHeaderBtn}
          onClick={() => { logout(); navigate('/login') }}
          aria-label="Keluar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        {/* Logo tengah */}
        <div style={{ color: '#f3f3f3', display: 'flex', alignItems: 'center', gap: 7 }}>
          <ThreadsterMiniLogo />
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px', fontFamily: 'Georgia, serif' }}>
            threadster
          </span>
        </div>

        {/* Spacer kanan supaya logo tetap center */}
        <div style={{ width: 40 }} />
      </header>

      <main style={s.feedWrap}>
        {/* Tab "Untuk Anda" — satu tab saja, disederhanakan */}
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...s.tabActive }}>Untuk Anda</button>
        </div>

        {refreshing && (
          <div style={s.refreshBar}>
            <span style={{ fontSize: 13, color: '#555' }}>Memperbarui...</span>
          </div>
        )}

        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : error ? (
          <div style={s.errorBox}>
            <p style={{ color: '#ff6b6b', fontSize: 14, marginBottom: 12 }}>{error}</p>
            <button style={s.retryBtn} onClick={() => loadPosts()}>Coba lagi</button>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#555', fontSize: 15 }}>
            Belum ada postingan. Jadilah yang pertama! ✍️
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <ThreadCard
                key={post.id}
                post={post}
                onLike={handleLike}
                showThread={false}
              />
            ))}
            <div style={s.endRow}>
              <button
                style={s.refreshBtnBottom}
                onClick={() => loadPosts(true)}
                disabled={refreshing}
              >
                {refreshing ? 'Memperbarui...' : '↻ Perbarui'}
              </button>
            </div>
          </>
        )}
      </main>

      <style>{`
        @media (max-width: 767px) { .threadster-mobile-header { display: flex !important; } }
        @media (min-width: 768px) { .threadster-mobile-header { display: none !important; } }
      `}</style>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0d0d0d',
    color: '#f3f3f3',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  mobileHeader: {
    display: 'none',
    position: 'sticky', top: 0, zIndex: 50,
    backgroundColor: '#0d0d0d',
    borderBottom: '1px solid #1a1a1a',
    height: 52,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
  },
  mobileHeaderBtn: {
    width: 40, height: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent', border: 'none',
    color: '#888', cursor: 'pointer',
    borderRadius: 10,
    flexShrink: 0,
  },
  feedWrap: {
    maxWidth: 580,
    margin: '0 auto',
    paddingBottom: 80,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #1a1a1a',
    position: 'sticky', top: 0,
    backgroundColor: '#0d0d0d',
    zIndex: 10,
  },
  tab: {
    flex: 1, padding: '14px 0',
    background: 'none', border: 'none',
    color: '#555', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', borderBottom: '2px solid transparent',
    fontFamily: 'inherit',
  },
  tabActive: {
    color: '#f3f3f3', borderBottom: '2px solid #f3f3f3',
  },
  refreshBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px 0',
  },
  skeletonCard: {
    display: 'flex', gap: 12, padding: 16,
    borderBottom: '1px solid #1a1a1a',
  },
  skeletonAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    backgroundColor: '#1a1a1a', flexShrink: 0,
  },
  skeletonLine: {
    height: 14, borderRadius: 7, backgroundColor: '#1a1a1a',
  },
  errorBox: { padding: 32, textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: 10, color: '#f3f3f3',
    padding: '10px 20px', cursor: 'pointer',
    fontSize: 14, fontFamily: 'inherit',
  },
  endRow: { display: 'flex', justifyContent: 'center', padding: '24px 0' },
  refreshBtnBottom: {
    background: 'none', border: '1px solid #222',
    borderRadius: 20, color: '#555',
    fontSize: 13, padding: '8px 20px',
    cursor: 'pointer', fontFamily: 'inherit',
  },
}