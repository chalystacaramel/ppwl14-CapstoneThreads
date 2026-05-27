// apps/frontend/src/pages/Feed.tsx
// Clone Threads.com — feed utama, terhubung ke backend

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ThreadCard from '../components/ThreadCard'
import type { ThreadPost } from '../components/ThreadCard'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../stores/auth.store'

// ─── Config ────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

// ─── Threads Logo (mobile header) ─────────────────────────────
function ThreadsLogo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 192 192" width={size} height={size} fill="currentColor">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.23c8.25.053 14.476 2.452 18.502 7.13 2.932 3.405 4.893 8.11 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z" />
    </svg>
  )
}

// ─── API helpers ───────────────────────────────────────────────
async function fetchPosts(token?: string | null): Promise<ThreadPost[]> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}/posts`, { headers })
  if (!res.ok) throw new Error('Gagal mengambil postingan')
  const data = await res.json()

  const raw: any[] = Array.isArray(data) ? data : (data.posts ?? data.data ?? [])
  return raw.map((p: any): ThreadPost => ({
    id: String(p.id),
    user: {
      id: String(p.user?.id ?? p.userId ?? ''),
      name: p.user?.name ?? 'Pengguna',
      username: p.user?.username ?? p.user?.name?.toLowerCase().replace(/\s+/g, '_'),
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
    headers: { 'Authorization': `Bearer ${token}` },
  })
}

// ─── Skeleton ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid #1e1e1e' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e1e1e', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 13, borderRadius: 6, background: '#1e1e1e', width: '35%', marginBottom: 8 }} />
        <div style={{ height: 13, borderRadius: 6, background: '#1e1e1e', width: '88%', marginBottom: 6 }} />
        <div style={{ height: 13, borderRadius: 6, background: '#1e1e1e', width: '60%' }} />
      </div>
    </div>
  )
}

// ─── Feed ──────────────────────────────────────────────────────
export default function Feed() {
  const [posts, setPosts]         = useState<ThreadPost[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [tab, setTab]             = useState<'foryou' | 'following'>('foryou')

  const { accessToken } = useAuthStore()
  const navigate = useNavigate()

  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPosts(accessToken)
      setPosts(data)
    } catch (err: any) {
      setError(err.message ?? 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => { loadPosts() }, [loadPosts])

  const handleLike = async (postId: string) => {
    if (!accessToken) return
    // Optimistic update already in ThreadCard
    await toggleLike(postId, accessToken)
  }

  return (
    <>
      <Navbar />

      {/* ── Page wrapper ── */}
      <div style={{
        minHeight: '100vh',
        background: '#101010',
        color: '#f3f3f3',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>

        {/* ── Mobile: logo header ── */}
        <header className="feed-mobile-header">
          <div style={{ color: '#f3f3f3' }}>
            <ThreadsLogo size={28} />
          </div>
        </header>

        {/* ── Feed column ── */}
        <main style={{ maxWidth: 620, margin: '0 auto', paddingBottom: 80 }} className="feed-main">

          {/* Tab bar — sticky, identical to Threads */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #1e1e1e',
            position: 'sticky', top: 0,
            background: '#101010', zIndex: 10,
          }}>
            {[
              { key: 'foryou',    label: 'Untuk Anda' },
              { key: 'following', label: 'Mengikuti' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key as any)}
                style={{
                  flex: 1, padding: '14px 0',
                  background: 'none', border: 'none',
                  color: tab === key ? '#f3f3f3' : '#555',
                  fontSize: 15, fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: tab === key ? '2px solid #f3f3f3' : '2px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <p style={{ color: '#555', fontSize: 15, marginBottom: 16 }}>
                Tidak dapat memuat postingan
              </p>
              <button
                onClick={loadPosts}
                style={{
                  background: '#1e1e1e', border: '1px solid #2a2a2a',
                  borderRadius: 10, color: '#f3f3f3',
                  padding: '10px 24px', cursor: 'pointer', fontSize: 14,
                  fontFamily: 'inherit',
                }}
              >
                Coba lagi
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ padding: '64px 16px', textAlign: 'center' }}>
              <p style={{ color: '#555', fontSize: 15, marginBottom: 16 }}>Belum ada postingan</p>
              <button
                onClick={() => navigate('/post/new')}
                style={{
                  background: '#f3f3f3', border: 'none',
                  borderRadius: 10, color: '#101010',
                  padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                Buat postingan pertama
              </button>
            </div>
          ) : (
            <>
              {posts.map((post, i) => (
                <ThreadCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  showThread={false}
                />
              ))}

              {/* End of feed */}
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#333' }}>Kamu sudah melihat semua postingan</p>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        /* Mobile header: only on small screens */
        .feed-mobile-header {
          display: none;
          position: sticky; top: 0; z-index: 50;
          background: #101010;
          border-bottom: 1px solid #1e1e1e;
          height: 52px;
          align-items: center; justify-content: center;
        }

        @media (max-width: 767px) {
          .feed-mobile-header { display: flex; }
        }

        /* Desktop: push content right of sidebar */
        @media (min-width: 768px) {
          .feed-main {
            margin-left: 72px !important;
            /* center within remaining space */
            margin-left: calc(72px + (100vw - 72px - 620px) / 2) !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1060px) {
          .feed-main {
            margin-left: 82px !important;
            max-width: calc(100vw - 90px) !important;
          }
        }
      `}</style>
    </>
  )
}